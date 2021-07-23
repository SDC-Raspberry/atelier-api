const {
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('./schemas.js');

// Helper functions

const newestCompare = (a, b) => {
  // Assuming UNIX timestamp
  return a.date - b.date;
}

const helpfulCompare = (a, b) => {
  return a.helpfulness - b.helpfulness;
}

const relevantCompare = (a, b) => {
  // Still don't know what this does. WIll set as helpfulness for now
  return a.helpfulness - b.helpfulness;
}

// Query Functions

const getReviews = async (page, count, sort, product_id) => {
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
    delete result._id;
    return result;
  });

  // Create array of executed queries as Promises
  const photoResults = await reviewResults.map(async (result, index) => {
    const photoQuery = ReviewPhoto.find()
      .where({ review_id: result.id });
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
};

// Export queries

module.exports = {
  getReviews
};
