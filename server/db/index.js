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

// Helper functions

const newestCompare = (a, b) => {
  // Assuming UNIX timestamp
  return a.date - b.date;
}

const helpfulCompare = (a, b) => {
  return a.helpfulness - b.helpfulness;
}

const relevantCompare = (a, b) => {
  // Still don't know what this does. WIll set as helpfulness for now
  return a.helpfulness - b.helpfulness;
}

// Query Functions

const getReviews = async (page, count, sort, product_id) => {
  page = page ? Number(page) : 1;
  count = count ? Number(count) : 5;
  let sortFunction;

  if (sort === "newest") {
    sortFunction = newestCompare;
  } else if (sort === "helpful") {
    sortFunction = helpfulCompare;
  } else if (sort === "relevant") {
    sortFunction = relevantCompare;
  }

  const offset = count * (page - 1);
  const totalResults = offset + count;
  const reviewQuery = Review.find()
    .where({product_id: product_id})
    .limit(totalResults);
  const result = await reviewQuery.exec();
  if (sortFunction) {
    result.sort(sortFunction);
  }
  result.splice(0, offset);
  return result;
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
  getReviews
};
