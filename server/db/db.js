// Initilize database

const mongoose = require("mongoose");
const dbName = "atelier";
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
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

  Product.findOne({})
    .then(result => console.log('products: ' + !!result))
    .then(() => Review.findOne({}))
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
