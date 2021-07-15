const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/atelier", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  const characteristicSchema = new mongoose.Schema({
    id: Number,
    product_id: Number,
    name: String,
  });
  const characteristicReviewSchema = new mongoose.Schema({
    id: Number,
    characteristic_id: Number,
    review_id: Number,
    value: Number,
  });
  const photoSchema = new mongoose.Schema({
    id: Number,
    review_id: Number,
    url: String,
  });
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
  });
  const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    slogan: String,
    description: String,
    category: String,
    default_price: String,
  });

  const Product = mongoose.model("Product", productSchema);
  const Review = mongoose.model("Review", reviewSchema);
  const Photo = mongoose.model("Photo", photoSchema);
  const CharacteristicReview = mongoose.model("CharacteristicReview", characteristicReviewSchema);
  const Characteristic = mongoose.model("Characteristic", characteristicSchema);

  const productTest = new Product({
    id: 1,
    name: "Camo Onesie",
    slogan: "Blend in to your crowd",
    description: "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
    category: "Jackets",
    default_price: 140,
  });
  const reviewTest = new Review({
    id: 1,
    product_id: 1,
    rating: 5,
    date: 1596080481467,
    summary: "This product was great!",
    body: "I really did or did not like this product based on whether it was sustainably sourced.  Then I found out that its made from nothing at all.",
    recommend: true,
    reported: false,
    reviewer_name: "funtime",
    reviewer_email: "first.last@gmail.com",
    response: null,
    helpfulness: 8,
  });
  const photoTest = new Photo({
    id: 1,
    review_id: 5,
    url: "https://images.unsplash.com/photo-1501088430049-71c79fa3283e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80",
  });
  const characteristicReviewTest = new CharacteristicReview({
    id: 1,
    characteristic_id: 1,
    review_id: 1,
    value: 4
  });
  const characteristicTest = new Characteristic({
    id: 1,
    product_id: 1,
    name: "Fit",
  });

  console.table(productTest.id);
  console.table(reviewTest.id);
  console.table(photoTest.id);
  console.table(characteristicReviewTest.id);
  console.table(characteristicTest.id);

  productTest.save()
    .then(() => reviewTest.save())
    .then(() => photoTest.save())
    .then(() => characteristicReviewTest.save())
    .then(() => characteristicTest.save())
    .then(() => Characteristic.find({}))
    .then(result => console.log(result));
});
