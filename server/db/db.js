// Initilize database

const mongoose = require("mongoose");
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;
const dbAddress = process.env.DB_ADDRESS;

const mongoAddress = `mongodb://${dbAddress}:${dbPort}/${dbName}`;
console.log(`mongo connection address: ${mongoAddress}`);

mongoose.connect(mongoAddress, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get Models

const {
  Counter,
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
} = require('./schemas.js');

// Connect to database

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log(`Mongoose DB "${dbName}" initialized\n`)

  Review.findOne({})
    .then(result => console.log('reviews: ' + !!result))
    .then(() => ReviewPhoto.findOne({}))
    .then(result => console.log('reviews_photos: ' + !!result))
    .then(() => CharacteristicReview.findOne({}))
    .then(result => console.log('characteristics_reviews: ' + !!result))
    .then(() => Characteristic.findOne({}))
    .then(result => console.log('characteristics: ' + !!result))
    .then(() => Counter.findOne({}))
    .then(result => console.log('counter: ' + !!result));
});

db.disconnect = () => {
  mongoose.disconnect();
};

module.exports = db;
