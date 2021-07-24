// Initialize Server
const express = require('express');
const app = express();

const db = require('./db/db.js');
const queries = require('./db/queries.js');

// GET /reviews/
app.get('/reviews', (req, res) => {
  const {
    page,
    count,
    sort,
    product_id
  } = req.query;

  queries.getReviews(page, count, sort, product_id)
    .then(result => res.end(JSON.stringify(result)));
});

// GET /reviews/meta
app.get('/reviews/meta', (req, res) => {
  const {
    product_id,
  } = req.query;

  queries.getReviewsMeta(product_id)
    .then(result => res.end(JSON.stringify(result)));
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

// PUT /reviews/:review_id/report
app.put('/reviews/:review_id/report', (req, res) => {
  const {
    review_id,
  } = req.body;

  // Run the db query
});

// Start the server
const server = app.listen(3000, () => console.log('listening on 3000\n'));

module.exports = {
  server,
  db
};
