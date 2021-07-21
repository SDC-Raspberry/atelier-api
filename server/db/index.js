// Initilize database

const mongoose = require("mongoose");
const dbName = "atelier";
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get Models

const {
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('./schemas.js');

// Connect to database

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log(`Mongoose DB "${dbName}" initialized\n`)

  Product.findOne({})
    .then(result => console.log('products: ' + !!result))
    .then(() => Review.findOne({}))
    .then(result => console.log('reviews: ' + !!result))
    .then(() => ReviewPhoto.findOne({}))
    .then(result => console.log('reviews_photos: ' + !!result))
    .then(() => CharacteristicReview.findOne({}))
    .then(result => console.log('characteristics_reviews: ' + !!result))
    .then(() => Characteristic.findOne({}))
    .then(result => console.log('characteristics: ' + !!result));
});

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

const sum = (acc, value) => acc + value;

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

  console.time('query');

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

  console.timeEnd('query');

  return output;
};

const getReviewsMeta = async (product_id) => {
  // create output object
  const output = {
    product_id,
    ratings: {},
    recommended: {},
    characteristics: {},
  };

  // Get product reviews
  console.time('reviews query');
  const reviewsQuery = Review.find({ product_id })
  let reviews;
  await reviewsQuery.lean().exec()
    .then(results => reviews = results);
  console.timeEnd('reviews query');

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
    if (review.recommend === true) {
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

  console.time('characteristicReview query');
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
    console.log(characteristic.ratings, characteristic.ratings.length);
    const value = characteristic.ratings.reduce(sum, 0) / characteristic.ratings.length;
    output.characteristics[characteristic.name] = {
      id: Number(id),
      value: value.toFixed(3),
    };
  }

  return output;
};

// Export queries

module.exports = {
  getReviews,
  getReviewsMeta
};
