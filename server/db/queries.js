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

const MESSAGE = {
  OK: 'OK',
  CREATED: 'CREATED',
  NO_CONTENT: 'NO CONTENT',
  INVALID: 'INVALID',
  ERROR: 'ERROR',
}

const getNextValue = async (collectionName) => {
  try {
    // increment value in collection
    const response = await Counter.findByIdAndUpdate(
      collectionName,
      { $inc: { value: 1 } },
      { new: true }
    ).exec();
    // return that incremented value
    return response.value;
  } catch (error) {
    console.error(error);
    return STATUS.ERROR;
  }
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

    product_id = Number(product_id);

    if (sort === "newest") {
      sortFunction = newestCompare;
    } else if (sort === "helpful") {
      sortFunction = helpfulCompare;
    } else if (sort === "relevant") {
      sortFunction = relevantCompare;
    }
    const offset = count * (page - 1);
    const totalResults = offset + count;
    const reviewResults = await Review.aggregate()
      .match({ product_id })
      .limit(totalResults)
      .lookup({
        from: 'reviews_photos',
        localField: 'id',
        foreignField: 'review_id',
        as: 'photos',
      })
      .project({
        _id: 0,
        review_id: '$id',
        date: 1,
        summary: 1,
        body: 1,
        recommend: 1,
        reviewer_name: 1,
        reviewer_email: 1,
        response: 1,
        helpfulness: 1,
        photos: {
          id: 1,
          url: 1
        }
      })

    if (sortFunction) {
      reviewResults.sort(sortFunction);
    }
    reviewResults.splice(0, offset);

    output.results = reviewResults;

    return {
      status: STATUS.OK,
      message: MESSAGE.OK,
      data: output,
    };
  } catch (error) {
    console.error(error);
    return {
      status: STATUS.ERROR,
      message: MESSAGE.ERROR,
    }
  }
};

const getReviewsMeta = async (product_id) => {
  try {
    // create output object
    product_id = Number(product_id);

    // Get product reviews
    const reviews = await Review.aggregate()
      .match({ product_id })
      .facet({
        // Ids
        ratingIds: [
          { $project: {
              _id: 0,
              id: 1
          }},
          { $group: {
            _id: null,
            id: { $addToSet: "$id" }
          }}
        ],
        // Ratings
        ratingsOne: [
          { $match: { rating: 1 }},
          { $count: 'count' },
        ],
        ratingsTwo: [
          { $match: { rating: 2 }},
          { $count: 'count' },
        ],
        ratingsThree: [
          { $match: { rating: 3 }},
          { $count: 'count' },
        ],
        ratingsFour: [
          { $match: { rating: 4 }},
          { $count: 'count' }
        ],
        ratingsFive: [
          { $match: { rating: 5 }},
          { $count: 'count' },
        ],
        // Recommended
        recommendTrue: [
          { $match: { recommend: true }},
          { $count: 'count' },
        ],
        recommendFalse: [
          { $match: { recommend: false }},
          { $count: 'count' },
        ]
      })
      .addFields({ product_id })
      .project({
        product_id: 1,
        ratingIds: { $ifNull: [
          { $first: '$ratingIds.id' },
          []
        ]},
        ratings: {
          1: { $first: '$ratingsOne.count' },
          2: { $first: '$ratingsTwo.count' },
          3: { $first: '$ratingsThree.count' },
          4: { $first: '$ratingsFour.count' },
          5: { $first: '$ratingsFive.count' },
        },
        recommended: {
          0: { $first: '$recommendFalse.count' },
          1: { $first: '$recommendTrue.count' },
        }
      });

    const output = {
      ...reviews[0],
      characteristics: {}
    };

    // Get characteristics

    const characteristicReviewResults = output.ratingIds.map(async (review_id) => {
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

    return {
      status: STATUS.OK,
      message: MESSAGE.OK,
      data: output,
    };
  } catch (error) {
    console.error(error);
    return {
      status: STATUS.ERROR,
      message: MESSAGE.ERROR,
    }
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

    if (!product_id || !rating || recommend === undefined || !name || !email || !photos || !characteristics) {
      return {
        status: STATUS.INVALID,
        message: MESSAGE.INVALID,
      };
    }

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
    return {
      status: STATUS.CREATED,
      message: MESSAGE.CREATED,
    };
  } catch (error) {
    console.error(error);
    return {
      status: STATUS.ERROR,
      message: MESSAGE.ERROR,
    };
  }
};

const putReviewHelpful = async (review_id) => {
  try {
    review_id = Number(review_id);
    if (isNaN(review_id)) {
      return {
        status: STATUS.INVALID,
        message: MESSAGE.INVALID,
      };
    }

    await Review.findOneAndUpdate(
      { id: review_id },
      { $inc: { helpfulness: 1 } },
      { new: true }
    ).exec();
    return {
      status: STATUS.NO_CONTENT,
      message: MESSAGE.NO_CONTENT,
    };
  } catch (error) {
    console.error(error);
    return {
      status: STATUS.ERROR,
      message: MESSAGE.ERROR,
    }
  }
};

const putReviewReport = async (review_id) => {
  try {
    review_id = Number(review_id);
    if (isNaN(review_id)) {
      return {
        status: STATUS.INVALID,
        message: MESSAGE.INVALID,
      };
    }

    await Review.findOneAndUpdate(
      { id: review_id },
      { reported: true },
      { new: true }
    ).exec();
    return {
      status: STATUS.NO_CONTENT,
      message: MESSAGE.NO_CONTENT,
    };
  } catch (error) {
    console.error(error);
    return {
      status: STATUS.ERROR,
      message: MESSAGE.ERROR,
    }
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
