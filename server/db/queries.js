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

const getCurrentUnixTimestamp = () => Math.floor(Date.now() / 1000);

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

    const output = {
      product: product_id,
      page: page,
      count: count,
      results: [],
    };

    product_id = Number(product_id);

    let sortKey;
    let sortFunction;
    if (sort === "newest") {
      sortKey = 'date';
      sortFunction = newestCompare;
    } else if (sort === "helpful") {
      sortKey = 'helpfulness';
      sortFunction = helpfulCompare;
    } else if (sort === "relevant") {
      sortKey = 'helpfulness';
      sortFunction = relevantCompare;
    }
    const offset = count * (page - 1);
    const totalResults = offset + count;
    const reviewResults = await Review.aggregate()
      .match({ product_id })
      .sort({ [sortKey]: -1 })
      .skip(offset)
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
      });

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
    const output = await Review.aggregate()
      .match({ product_id })
      .facet({
        // Ratings
        _ratings: [
          { $group: {
            _id: "$rating",
            count: { $sum: 1 }
          }},
          { $project: {
            _id: 0,
            k: { $toString: "$_id" },
            v: "$count"
          }},
        ],
        // Recommended
        _recommended: [
          { $group: {
            _id: "$recommend",
            count: { $sum: 1 }
          }},
          { $project: {
            _id: 0,
            k: { $toString: { $cond: ["$_id", 1, 0 ]}},
            v: "$count"
          }},
        ],
        // Characteristics
        characteristics: [
          { $project: {
            _id: 0,
            review_id: '$id'
          }},
          { $lookup: {
            from: 'characteristic_reviews',
            localField: 'review_id',
            foreignField: 'review_id',
            as: 'characteristic_reviews'
          }},
          { $unwind: '$characteristic_reviews' },
          { $project: {
            characteristic_id: '$characteristic_reviews.characteristic_id',
            id: '$characteristic_reviews.id',
            review_id: '$characteristic_reviews.review_id',
            value: '$characteristic_reviews.value',
          }},
          { $lookup: {
            from: 'characteristics',
            localField: 'characteristic_id',
            foreignField: 'id',
            as: 'characteristic_details'
          }},
          { $project: {
            id: 1,
            name: { $first: '$characteristic_details.name' },
            singleValue: '$value',
          }},
          { $group: {
            _id: '$name',
            id: { $first: '$id' },
            value: { $avg: '$singleValue' },
          }},
          { $project: {
            _id: 0,
            k: '$_id',
            v: {
              id: '$id',
              value: '$value'
            }
          }},
        ]
      })
      .addFields({ product_id })
      .project({
        product_id: product_id,
        ratings: {
          $mergeObjects: [
            { $arrayToObject: "$_ratings" }
          ]
        },
        recommended: {
          $mergeObjects: [
            { $arrayToObject: "$_recommended" }
          ]
        },
        characteristics: {
          $mergeObjects: [
            { $arrayToObject: "$characteristics" }
          ]
        }
      });

    return {
      status: STATUS.OK,
      message: MESSAGE.OK,
      data: output[0],
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
    const newReview = [{
      insertOne: {
        document: {
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
        }
      }
    }];

    const newReviewPhotos = [];
    photos.forEach(async photoUrl => {
      newReviewPhotos.push({
        insertOne: {
          document: {
            id: await getNextValue('reviews_photos'),
            review_id: newReviewId,
            url: photoUrl,
          },
        },
      });
    });

    const newCharacteristicReviews = [];
    Object.keys(characteristics).forEach(async characteristic_id => {
      newCharacteristicReviews.push({
        insertOne: {
          document: {
            id: await getNextValue('characteristic_reviews'),
            characteristic_id,
            review_id: newReviewId,
            value: characteristics[characteristic_id],
          },
        },
      });
    });

    return await Promise.all([
      Review.bulkWrite(newReview),
      ReviewPhoto.bulkWrite(newReviewPhotos),
      CharacteristicReview.bulkWrite(newCharacteristicReviews)
    ]).then(() => {
      return {
        status: STATUS.CREATED,
        message: MESSAGE.CREATED,
      };
    });
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
      { $inc: { helpfulness: 1 } }
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
