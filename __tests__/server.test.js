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

describe('Server tests', () => {
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
  })

  after((done) => {
    db.disconnect();
    server.close();
    done();
  });
});
