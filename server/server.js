require('dotenv').config()

// Initialize Server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.SERVER_PORT || 9999;

app.use(bodyParser.json());

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
    .then(response => {
      res.status(response.status).end(JSON.stringify(response.data));
    })
    .catch(error => res.status(500));
});

// GET /reviews/meta
app.get('/reviews/meta', (req, res) => {
  const {
    product_id,
  } = req.query;

  queries.getReviewsMeta(product_id)
    .then(response => {
      res.status(response.status).end(JSON.stringify(response.data));
    })
    .catch(error => res.status(500));
});

// POST /reviews
app.post('/reviews', (req, res) => {
  queries.postReview(req.body)
    .then(response => {
      res.status(response.status).send(JSON.stringify(response.message));
    })
    .catch(error => res.status(500));
});

// PUT /reviews/:review_id/helpful
app.put('/reviews/:review_id/helpful', (req, res) => {
  const {
    review_id,
  } = req.params;

  queries.putReviewHelpful(review_id)
    .then(response => {
      res.status(response.status).send(JSON.stringify(response.message));
    })
    .catch(error => res.status(500));
});

// PUT /reviews/:review_id/report
app.put('/reviews/:review_id/report', (req, res) => {
  const {
    review_id,
  } = req.params;

  queries.putReviewReport(review_id)
    .then(response => {
      res.status(response.status).send(JSON.stringify(response.message));
    })
    .catch(error => res.status(500));
});

// Start the server
const server = app.listen(PORT, () => console.log(`listening on ${PORT}\n`));

module.exports = {
  server,
  db
};
