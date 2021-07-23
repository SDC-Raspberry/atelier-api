const axios = require('axios');
const assert = require('chai').assert;
const mongoose = require('mongoose');

let server, db;

describe('Server tests', () => {
  before((done) => {
    const app = require('../server/server.js');
    server = app.server;
    db = app.db;
    done();
  });

  it('should test an API', () => {
    return axios.get('https://jsonplaceholder.typicode.com/todos/1')
      .then(result => {
        assert.deepEqual(result.data, {
        "userId": 1,
        "id": 1,
        "title": "delectus aut autem",
        "completed": false
      });
    });
  });

  after((done) => {
    db.disconnect();
    server.close();
    done();
  });
});
