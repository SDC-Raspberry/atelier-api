const mongoose = require("mongoose");

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
const reviewPhotoSchema = new mongoose.Schema({
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

// Create models

const Product = mongoose.model("products", productSchema);
const Review = mongoose.model("reviews", reviewSchema);
const ReviewPhoto = mongoose.model("reviews_photos", reviewPhotoSchema);
const CharacteristicReview = mongoose.model("characteristic_reviews", characteristicReviewSchema);
const Characteristic = mongoose.model("characteristics", characteristicSchema);

module.exports = {
  Product,
  Review,
  ReviewPhoto,
  CharacteristicReview,
  Characteristic
};
