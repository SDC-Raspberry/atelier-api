// Initilize database

const mongoose = require("mongoose");
const dbName = "atelier";
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas and Models

const noTimestamps = {
  timestamps: false
};

const characteristicSchema = new mongoose.Schema({
  id: Number,
  product_id: Number,
  name: String,
}, noTimestamps);
const characteristicReviewSchema = new mongoose.Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
}, noTimestamps);
const photoSchema = new mongoose.Schema({
  id: Number,
  review_id: Number,
  url: String,
}, noTimestamps);
const reviewSchema = new mongoose.Schema({
  id: Number,
  product_id: Number,
  rating: Number,
  date: Number,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,
}, noTimestamps);
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  slogan: String,
  description: String,
  category: String,
  default_price: String,
}, noTimestamps);

const Product = mongoose.model("products", productSchema);
const Review = mongoose.model("reviews", reviewSchema);
const Photo = mongoose.model("reviews_photos", photoSchema);
const CharacteristicReview = mongoose.model("characteristic_reviews", characteristicReviewSchema);
const Characteristic = mongoose.model("characteristics", characteristicSchema);

// Queries for export

const getAllProducts = () => {
  return Product.findOne({});
};

// Connect to database

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log(`Mongoose DB "${dbName}" initialized\n`)

  Product.findOne({})
    .then(result => console.log('products: ' + !!result))
    .then(() => Review.findOne({}))
    .then(result => console.log('reviews: ' + !!result))
    .then(() => Photo.findOne({}))
    .then(result => console.log('reviews_photos: ' + !!result))
    .then(() => CharacteristicReview.findOne({}))
    .then(result => console.log('characteristics_reviews: ' + !!result))
    .then(() => Characteristic.findOne({}))
    .then(result => console.log('characteristics: ' + !!result));
});

// Export queries

module.exports = {
  getAllProducts
};
