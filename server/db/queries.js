const {
  Counter,
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('./schemas.js');

// Helper functions

const STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  INVALID: 400,
  ERROR: 500,
};

const getNextValue = async (collectionName) => {
  // increment value in collection
  const response = await Counter.findByIdAndUpdate(
    collectionName,
    { $inc: { value: 1 } },
    { new: true }
  ).exec();
  // return that incremented value
  return response.value
};

const getCurrentUnixTimestamp = () => Math.floor(new Date().getTime() / 1000);

const newestCompare = (a, b) => {
  // Assuming UNIX timestamp
  return b.date - a.date;
}

const helpfulCompare = (a, b) => {
  return b.helpfulness - a.helpfulness;
}

const relevantCompare = (a, b) => {
  // Still don't know what this does. WIll set as helpfulness for now
  return b.helpfulness - a.helpfulness;
}

const sum = (acc, value) => acc + value;

// Query Functions

const getReviews = async (page, count, sort, product_id) => {
  try {
    page = page ? Number(page) : 1;
    count = count ? Number(count) : 5;
    let sortFunction;

    const output = {
      product: product_id,
      page: page,
      count: count,
      results: [],
    };

    if (sort === "newest") {
      sortFunction = newestCompare;
    } else if (sort === "helpful") {
      sortFunction = helpfulCompare;
    } else if (sort === "relevant") {
      sortFunction = relevantCompare;
    }
    const offset = count * (page - 1);
    const totalResults = offset + count;
    const reviewQuery = Review.find()
      .where({ product_id: product_id })
      .limit(totalResults);

    let reviewResults = await reviewQuery.lean().exec();
    if (sortFunction) {
      reviewResults.sort(sortFunction);
    }
    reviewResults.splice(0, offset);
    // Remove mongo default _id field
    reviewResults = reviewResults.map(result => {
      result.review_id = result.id;
      delete result._id;
      delete result.id;
      delete result.product_id;
      delete result.reported;
      delete result.reviewer_email;
      return result;
    });

    // Create array of executed queries as Promises
    const photoResults = await reviewResults.map(async (result, index) => {
      const photoQuery = ReviewPhoto.find()
        .where({ review_id: result.review_id });
      return await photoQuery.lean().exec();
    });

    // When all promises have resolved, add them to output
    await Promise.all(photoResults)
      .then(allResults => {
        allResults.map((result, index) => {
          reviewResults[index].photos = result.map(photo => {
            delete photo._id;
            delete photo.review_id;
            return photo;
          });
        });
      });

    output.results = reviewResults;

    return output;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
};

const getReviewsMeta = async (product_id) => {
  try {
    // create output object
    const output = {
      product_id,
      ratings: {},
      recommended: {},
      characteristics: {},
    };

    // Get product reviews
    const reviewsQuery = Review.find({ product_id })
    let reviews;
    await reviewsQuery.lean().exec()
      .then(results => reviews = results);

    const ratingIds = [];

    reviews.forEach((review) => {
      // Add rating ID to ratingIds array
      ratingIds.push(review.id);

      // Add rating to output
      if (!output.ratings[review.rating]) {
        output.ratings[review.rating] = 1;
      } else {
        output.ratings[review.rating] += 1;
      }

      // Add recommendation
      let recommend;
      if (review.recommend) {
        recommend = 1;
      } else {
        recommend = 0;
      }
      if (!output.recommended[recommend]) {
        output.recommended[recommend] = 1;
      } else {
        output.recommended[recommend] += 1;
      }
    });

    // Get characteristics

    const characteristicReviewResults = ratingIds.map(async (review_id) => {
      const query = CharacteristicReview.find({ review_id });
      return await query.lean().exec();
    });

    const characteristicLookup = {};

    // Add each characteristic to the lookup
    await Promise.all(characteristicReviewResults)
      .then(results => {
        results.forEach(result => {
          result.forEach(characteristic => {
            if (!characteristicLookup[characteristic.characteristic_id]) {
              characteristicLookup[characteristic.characteristic_id] = {
                name: '',
                ratings: [characteristic.value],
              };
            } else {
              characteristicLookup[characteristic.characteristic_id].ratings.push(characteristic.value);
            }
          });
        });
      });

    // Get the individual characteristic details
    const characteristicResults = Object.keys(characteristicLookup).map(id => {
      const query = Characteristic.find({ id });
      return query.lean().exec();
    });

    await Promise.all(characteristicResults)
      .then(results => {
        results.forEach(characteristic => {
          characteristic = characteristic[0];
          characteristicLookup[characteristic.id].name = characteristic.name;
        });
      });

    // Add correctly formatted characteristics to the output
    for (const id in characteristicLookup) {
      const characteristic = characteristicLookup[id];
      const value = characteristic.ratings.reduce(sum, 0) / characteristic.ratings.length;
      output.characteristics[characteristic.name] = {
        id: Number(id),
        value: value.toFixed(3),
      };
    }

    return output;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
};

const postReview = async (reqBody) => {
  try {
    const {
      product_id,
      rating,
      summary,
      body,
      recommend,
      name,
      email,
      photos,
      characteristics
    } = reqBody;

    const newReviewId = await getNextValue('reviews');
    const newReview = {
      id: newReviewId,
      product_id,
      rating,
      date: getCurrentUnixTimestamp(),
      summary,
      body,
      recommend,
      reported: false,
      reviewer_name: name,
      reviewer_email: email,
      response: '',
      helpfulness: 0,
    };

    const newReviewPhotos = [];
    photos.forEach(async photoUrl => {
      const newReviewPhotoId = await getNextValue('reviews_photos');
      newReviewPhotos.push({
        id: newReviewPhotoId,
        review_id: newReviewId,
        url: photoUrl,
      });
    });

    const newCharacteristicReviews = [];
    for (const characteristic_id in characteristics) {
      const newCharacteristicReviewId = await getNextValue('characteristic_reviews');
      newCharacteristicReviews.push({
        id: newCharacteristicReviewId,
        characteristic_id,
        review_id: newReviewId,
        value: characteristics[characteristic_id],
      });
    }

    await Review.create(newReview);
    await ReviewPhoto.insertMany(newReviewPhotos);
    await CharacteristicReview.insertMany(newCharacteristicReviews);
    return STATUS.OK;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
};

const putReviewHelpful = async (review_id) => {
  try {
    review_id = Number(review_id);
    if (isNaN(review_id)) {
      return STATUS.INVALID;
    }

    await Review.findOneAndUpdate(
      { id: review_id },
      { $inc: { helpfulness: 1 } },
      { new: true }
    ).exec();
    return STATUS.NO_CONTENT;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
};

const putReviewReport = async (review_id) => {
  try {
    review_id = Number(review_id);
    if (isNaN(review_id)) {
      return STATUS.INVALID;
    }

    await Review.findOneAndUpdate(
      { id: review_id },
      { reported: true },
      { new: true }
    ).exec();
    return STATUS.NO_CONTENT;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
};

// Export queries

module.exports = {
  getNextValue,
  getReviews,
  getReviewsMeta,
  postReview,
  putReviewHelpful,
  putReviewReport,
};
