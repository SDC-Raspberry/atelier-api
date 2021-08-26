const util = require('util');

const redis = require('redis');
const client = redis.createClient(6379);

client.on("error", (error) => {
  console.error(error);
});

const getRedisKey = (routeName, params) => {
  let redisKey = routeName;
  const { product_id } = params;
  if (product_id) {
    redisKey += product_id;
  }
  let sortedKeys = Object.keys(params).sort().filter(key => key !== 'product_id');
  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    redisKey += params[key];
  }

  console.log('redisKey:', redisKey);

  return redisKey;
};

const redisGet = util.promisify(client.get).bind(client);

module.exports = {
  client,
  getRedisKey,
  redisGet,
};
