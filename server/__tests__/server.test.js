const axios = require('axios');

test('API test works', () => {
  return axios.get('https://jsonplaceholder.typicode.com/todos/1')
    .then(result => expect(result.data).toStrictEqual({
      "userId": 1,
      "id": 1,
      "title": "delectus aut autem",
      "completed": false
    }));
});
