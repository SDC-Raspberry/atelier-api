const axios = require('axios');
const assert = require('chai').assert;
const mongoose = require('mongoose');

let server, db;

const {
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('../server/db/schemas.js');

const {
  reviewMockData,
  reviewPhotoMockData
} = require('./_mockData.js');

xdescribe('Server tests', () => {
  before((done) => {
    const app = require('../server/server.js');
    server = app.server;
    db = app.db;
    done();
  });

  describe('GET /reviews', () => {
    // before tests
      // add review and review photo to db
      // give it a product_id that should not be found in the db

    it('should get the expected shape of data from the query', () => {
      return axios.get('http://localhost:3000/reviews?product_id=22120')
        .then(response => {
          // Whole return
          assert.isObject(response.data);
          assert.containsAllKeys(response.data, [
            'product',
            'page',
            'count',
            'results',
          ]);

          // Results array
          const results = response.data.results;
          assert.isArray(results);
          assert.containsAllKeys(results[0], [
            'review_id',
            'rating',
            'summary',
            'recommend',
            'response',
            'body',
            'date',
            'reviewer_name',
            'helpfulness',
            'photos',
          ]);

          // Photos
          assert.isArray(results[0].photos);
        });

      // after tests
        // remove inserted reviews by unique id
    });
  });

  describe('GET /reviews/meta', () => {
    // before tests
      // add review and review photo to db
      // give it a product_id that should not be found in the db

    it('should get the expected shape of data from the query', () => {
      return axios.get('http://localhost:3000/reviews/meta?product_id=22120')
        .then(response => {
          // Whole return
          assert.isObject(response.data);
          assert.containsAllKeys(response.data, [
            "product_id",
            "ratings",
            "recommended",
            "characteristics",
          ]);
        });

      // after tests
        // remove inserted reviews by unique id
    });
  });

  describe('POST /reviews', () => {
    it('should get the expected status in return for success', () => {
      const body = {
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
      };
      return axios.post('http://localhost:3000/reviews', body)
        .then(response => assert.equal(response.status, 201));
    });

    it('should get the expected status in return for failure', () => {
      const body = {
        rating: 4,
        body: "They are very dark. But that's good because I'm in erysunny spots",
        recommend: false,
        name: "Mister Twister",
        email: "mister@twister.com",
        photos: ["google.com"],
        characteristics: {
          "42": 4,
          "41": 2
        },
      };
      return axios.post('http://localhost:3000/reviews', body)
        .then(response => { throw new Error('Should not succeed.'); })
        .catch(error => assert.equal(error.response.status, 400));
    });
  });

  describe('PUT /reviews/:review_id/helpful', () => {
    it('should get the expected status in return for success', () => {
      return axios.put('http://localhost:3000/reviews/5774968/helpful')
        .then(response => assert.equal(response.status, 204));
    });

    it('should get the expected status in return for failure', () => {
      return axios.put('http://localhost:3000/reviews/abcd/helpful')
        .then(response => { throw new Error('Should not succeed.'); })
        .catch(error => assert.equal(error.response.status, 400));
    });
  });

  describe('PUT /reviews/:review_id/report', () => {
    it('should get the expected status in return for success', () => {
      return axios.put('http://localhost:3000/reviews/5774968/report')
        .then(response => assert.equal(response.status, 204));
    });

    it('should get the expected status in return for failure', () => {
      return axios.put('http://localhost:3000/reviews/abcd/report')
        .then(response => { throw new Error('Should not succeed.'); })
        .catch(error => assert.equal(error.response.status, 400));
    });
  });

  after((done) => {
    db.disconnect();
    server.close();
    done();
  });
});
