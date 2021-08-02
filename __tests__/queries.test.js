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

const mockData = require('./_mockData.js');

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

    it('should get two entries for a given product_id that include photo entries', () => {
      return Review.collection.insertMany(mockData.review)
        .then(() => ReviewPhoto.collection.insertMany(mockData.reviewPhoto))
        .then(() => queries.getReviews(1, 5, undefined, 12))
        .then(response => {
          const results = response.results;
          assert.lengthOf(results, 2);
          assert.propertyVal(results[0], 'reviewer_name', 'Sallie_Kovacek');
          assert.isArray(results[0].photos);
          assert.lengthOf(results[0].photos, 1);
          assert.propertyVal(results[0].photos[0], 'id', 13);
          assert.propertyVal(results[0].photos[0], 'url', 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80');
        });
    });

    it('should return an empty array when no entries exist at a given product_id', () => {
      return Review.collection.insertMany(mockData.review)
        .then(() => ReviewPhoto.collection.insertMany(mockData.reviewPhoto))
        .then(() => queries.getReviews(1, 5, undefined, -1))
        .then(response => {
          assert.isArray(response.results);
          assert.lengthOf(response.results, 0);
        });
    });
  });

  describe('getReviewsMeta', () => {
    beforeEach((done) => {
      Review.deleteMany({})
        .then(() => CharacteristicReview.deleteMany({}))
        .then(() => Characteristic.deleteMany({}))
        .then(() => Review.collection.insertMany(mockData.review))
        .then(() => CharacteristicReview.collection.insertMany(mockData.characteristicReview))
        .then(() => Characteristic.collection.insertMany(mockData.characteristic))
        .then(() => done());
    });

    it('should return the meta content for a query', () => {
      return queries.getReviewsMeta(12345)
        .then(response => {
          assert.propertyVal(response, 'product_id', 12345);
        });
    });

    it('should get an entry for a given product_id that includes multiple characteristics', () => {
      return queries.getReviewsMeta(12)
        .then(response => {
          assert.isObject(response.ratings);
          assert.isObject(response.recommended);
          assert.isObject(response.characteristics);
          assert.lengthOf(Object.keys(response.characteristics), 4);
        });
    });

    it('should collate both ratings into ratings object with one 2 and one 4', () => {
      return queries.getReviewsMeta(12)
        .then(response => {
          assert.propertyVal(response.ratings, "2", 1);
          assert.propertyVal(response.ratings, "4", 1);
        });
    });

    it('should collate both recommend values into recommended object with one 0 and one 1', () => {
      return queries.getReviewsMeta(12)
        .then(response => {
          assert.propertyVal(response.recommended, "0", 1);
          assert.propertyVal(response.recommended, "1", 1);
        });
    });

    it('should collate all characteristics and average their values', () => {
      return queries.getReviewsMeta(12)
        .then(response => {
          assert.containsAllKeys(response.characteristics, [
            "Fit",
            "Length",
            "Comfort",
            "Quality"
          ]);
          assert.equal(response.characteristics["Fit"].value, (2 + 2) / 2);
          assert.equal(response.characteristics["Length"].value, (2 + 1) / 2);
          assert.equal(response.characteristics["Comfort"].value, (2 + 4) / 2);
          assert.equal(response.characteristics["Quality"].value, (4 + 3) / 2);
        });
    });
  });

  after((done) => {
    mongoose.disconnect();
    done();
  });
});
