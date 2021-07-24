// Initialize Server
const express = require('express');
const app = express();

const db = require('./db');

// GET /reviews/
app.get('/reviews', (req, res) => {
  const {
    page,
    count,
    sort,
    product_id
  } = req.query;

  db.getReviews(page, count, sort, product_id)
    .then(result => res.end(JSON.stringify(result)));
});

// GET /reviews/meta
app.get('/reviews/meta', (req, res) => {
  const {
    product_id,
  } = req.query;

  // Run the db query
});

// POST /reviews
app.post('/reviews', (req, res) => {
  const {
    product_id,
    rating,
    summary,
    body,
    recommend,
    name,
    email,
    photos,
    characteristics
  } = req.body;

  // Run the db query
});

// PUT /reviews/:review_id/helpful
app.put('/reviews/:review_id/helpful', (req, res) => {
  const {
    review_id,
  } = req.body;

  // Run the db query
});

// PUT /reviews/:review_id/helpful
app.put('/reviews/:review_id/report', (req, res) => {
  const {
    review_id,
  } = req.body;

  // Run the db query
});

// Start the server
app.listen(3000, () => console.log('listening on 3000\n'));
