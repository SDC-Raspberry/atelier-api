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

// Define mock data

const {
  reviewMockData
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
        .then(() => done());
    });

    // do all the query tests
    it('should add entries into the db', () => {
      return Review.collection.insertMany(reviewMockData)
        .then(result => {
          const query = Review.find({ product_id : 1 });
          return query.lean().exec()
            .then(result => {
              assert.lengthOf(result, 1);
              assert.propertyVal(result[0], 'reviewer_name', 'mymainstreammother');
              assert.propertyVal(result[0], 'reviewer_email', 'first.last@gmail.com');
            });
        }).then(result => {
          const query = Review.find({ product_id : 2 });
          return query.lean().exec()
            .then(result => {
              assert.lengthOf(result, 1);
              assert.propertyVal(result[0], 'reviewer_name', 'negativity');
              assert.propertyVal(result[0], 'reviewer_email', 'first.last@gmail.com');
            });
        });
    });

    after((done) => {
      mongoose.disconnect();
      done();
    });
  });
});
