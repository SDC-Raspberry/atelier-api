const assert = require('chai').assert;

const mongoose = require("mongoose");
const dbName = "atelier-test";

const {
  Counter,
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

  beforeEach((done) => {
    Counter.deleteMany({})
      .then(() => Counter.insertMany([
        { _id: 'products', value: 100 },
        { _id: 'reviews', value: 100 },
        { _id: 'reviews_photos', value: 100 },
        { _id: 'characteristics', value: 100 },
        { _id: 'characteristic_reviews', value: 100 },
      ]))
      .then(() => done());
  });

  describe('getNextValue', () => {
    before((done) => {
      Counter.deleteMany({})
        .then(() => Counter.insertMany([
          { _id: 'products', value: 100 },
          { _id: 'reviews', value: 100 },
          { _id: 'reviews_photos', value: 100 },
          { _id: 'characteristics', value: 100 },
          { _id: 'characteristic_reviews', value: 100 },
        ]))
        .then(() => done());
    });

    it('should increment counters', () => {
      return Counter.findOne({ _id: 'products' })
        .then(response => {
          assert.equal(response.value, 100);
        })
        .then(() => queries.getNextValue('products'))
        .then(response => {
          assert.equal(response, 101);
        });
    });
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

  describe('postReview', () => {
    beforeEach((done) => {
      Review.deleteMany({})
        .then(() => ReviewPhoto.deleteMany({}))
        .then(() => CharacteristicReview.deleteMany({}))
        .then(() => Characteristic.deleteMany({}))
        .then(() => Review.insertMany(mockData.review))
        .then(() => ReviewPhoto.insertMany(mockData.reviewPhoto))
        .then(() => Characteristic.insertMany(mockData.characteristic))
        .then(() => CharacteristicReview.insertMany(mockData.characteristicReview))
        .then(() => done());
    });

    it('should insert a single review', async () => {
      return queries.postReview({
        product_id: 12,
        rating: 4,
        summary: "I am liking these glasses",
        body: "They are very dark. But that's good because I'm in erysunny spots",
        recommend: false,
        name: "Mister Twister",
        email: "mister@twister.com",
        photos: ["google.com"],
        characteristics: {
          "42": 4,
          "41": 2
        },
      }).then(status => assert.equal(status, 200))
        .then(() => {
          const query = Review.findOne().sort({ id: -1 });
          return query.lean().exec();
        })
        .then(result => {
          assert.propertyVal(result, 'id', 101);
          assert.propertyVal(result, 'product_id', 12);
          assert.propertyVal(result, 'rating', 4);
          assert.propertyVal(result, 'summary', 'I am liking these glasses');
          assert.propertyVal(result, 'body', 'They are very dark. But that\'s good because I\'m in erysunny spots');
          assert.propertyVal(result, 'recommend', false);
          assert.propertyVal(result, 'reviewer_name', 'Mister Twister');
          assert.propertyVal(result, 'reviewer_email', 'mister@twister.com');
        })
        .then(() => {
          const query = ReviewPhoto.findOne().sort({ id: -1 });
          return query.lean().exec();
        })
        .then(result => {
          assert.propertyVal(result, 'id', 101);
          assert.propertyVal(result, 'review_id', 101);
          assert.propertyVal(result, 'url', 'google.com');
        })
        .then(() => {
          const query = CharacteristicReview.find().sort({ id: -1 }).limit(2);
          return query.lean().exec();
        })
        .then(result => {
          result.sort((a, b) => a.characteristic_id - b.characteristic_id);
          const firstResult = result[0];
          assert.propertyVal(firstResult, 'id', 101);
          assert.propertyVal(firstResult, 'characteristic_id', 41);
          assert.propertyVal(firstResult, 'review_id', 101);
          assert.propertyVal(firstResult, 'value', 2);
          const secondResult = result[1];
          assert.propertyVal(secondResult, 'id', 102);
          assert.propertyVal(secondResult, 'characteristic_id', 42);
          assert.propertyVal(secondResult, 'review_id', 101);
          assert.propertyVal(secondResult, 'value', 4);
        });
    });
  });

  describe('putReviewHelpful', () => {
    beforeEach((done) => {
      Review.deleteMany({})
        .then(() => Review.insertMany(mockData.review))
        .then(() => done());
    });

    it('should increment helpful number for selected review', () => {
      return Review.findOne({ id: 2 })
        .then(review => assert.propertyVal(review, 'helpfulness', 2))
        .then(() => queries.putReviewHelpful('2'))
        .then(status => assert.equal(status, 204))
        .then(() => {
          const query = Review.findOne({ id: 2 });
          return query.lean().exec();
        })
        .then(result => {
          assert.propertyVal(result, 'helpfulness', 3);
        });
    });

    it('should return 400 if nothing or bad review_id provided', () => {
      return queries.putReviewHelpful()
        .then(status => assert.equal(status, 400))
        .then(() => queries.putReviewHelpful('bad'))
        .then(status => assert.equal(status, 400));
    });
  });

  after((done) => {
    mongoose.disconnect();
    done();
  });
});
