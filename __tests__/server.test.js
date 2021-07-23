const axios = require('axios');
const assert = require('chai').assert;

describe('Server tests', () => {
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
});
