const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/atelier', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  const characteristicSchema = new mongoose.Schema({
    characteristic: String,
    rating: Number
  });
  const photoSchema = new mongoose.Schema({
    photo_id: Number,
    url: String
  });
  const reviewSchema = new mongoose.Schema({
    review_id: Number,
    rating: Number,
    summary: String,
    recommend: Boolean,
    reported: Boolean,
    response: String,
    body: String,
    date: Number,
    reviewer_name: String,
    reviewer_email: String,
    helpfulness: Number,
    photos: [photoSchema],
    characteristics: [characteristicSchema]
  });
  const productSchema = new mongoose.Schema({
    product_id: Number,
    name: String,
    category: String,
    slogan: String,
    description: String,
    default_price: String,
    reviews: [reviewSchema]
  });
  const Review = mongoose.model('Review', reviewSchema);

  const productTest = new Review({
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
    photos: [{
      photo_id: 1,
      url: "https://images.unsplash.com/photo-1560570803-7474c0f9af99?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=975&q=80",
    },
    {
      photo_id: 2,
      url: "https://images.unsplash.com/photo-1561693532-9ff59442a7db?ixlib=rb-1.2.1&auto=format&fit=crop&w=975&q=80"
    }],
    characteristics: [{
      characteristic: "Fit",
      rating: 4,
    },
    {
      characteristic: "Length",
      rating: 3,
    },
    {
      characteristic: "Comfort",
      rating: 5,
    },
    {
      characteristic: "Quality",
      rating: 4,
    }],
  });
  console.log(productTest.date);
  productTest.save()
    .then(() => console.log('yeah'));
});