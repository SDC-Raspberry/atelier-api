const assert = require('chai').assert;

const mongoose = require("mongoose");
const dbName = "atelier-test";

const {
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('../server/db/schemas.js');

const queries = require('../server/db/queries.js');

const {
  reviewMockData,
  reviewPhotoMockData
} = require('./_mockData.js');

describe("Query Tests", () => {
  before((done) => {
    mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', done);
  });

  describe('getReviews', () => {
    beforeEach((done) => {
      Review.deleteMany({})
        .then(() => ReviewPhoto.deleteMany({}))
        .then(() => done());
    });

    it('should return the meta content for a query', () => {
      return queries.getReviews(1, 5, undefined, 12345)
        .then(response => {
          assert.propertyVal(response, 'product', 12345);
          assert.propertyVal(response, 'page', 1);
          assert.propertyVal(response, 'count', 5);
          assert.exists(response.results);
        });
    });

    it('should get an entry for a given product_id that includes a photo entry', () => {
      return Review.collection.insertMany(reviewMockData)
        .then(() => ReviewPhoto.collection.insertMany(reviewPhotoMockData))
        .then(() => queries.getReviews(1, 5, undefined, 12))
        .then(response => {
          const results = response.results;
          assert.lengthOf(results, 1);
          assert.propertyVal(results[0], 'reviewer_name', 'Sallie_Kovacek');
          assert.propertyVal(results[0], 'reviewer_email', 'Magdalen49@yahoo.com');
          assert.isArray(results[0].photos);
          assert.lengthOf(results[0].photos, 1);
          assert.propertyVal(results[0].photos[0], 'id', 13);
          assert.propertyVal(results[0].photos[0], 'url', 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80');
        });
    });

    it('should return an empty array when no entries exist at a given product_id', () => {
      return Review.collection.insertMany(reviewMockData)
        .then(() => ReviewPhoto.collection.insertMany(reviewPhotoMockData))
        .then(() => queries.getReviews(1, 5, undefined, -1))
        .then(response => {
          assert.isArray(response.results);
          assert.lengthOf(response.results, 0);
        });
    });

    after((done) => {
      mongoose.disconnect();
      done();
    });
  });
});
