// Initialize Server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

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

  console.time('getReviews');
  queries.getReviews(page, count, sort, product_id)
    .then(response => {
      console.timeEnd('getReviews');
      res.status(response.status).end(JSON.stringify(response.data));
    })
    .catch(error => res.status(500));
});

// GET /reviews/meta
app.get('/reviews/meta', (req, res) => {
  const {
    product_id,
  } = req.query;

  console.time('getReviewsMeta');
  queries.getReviewsMeta(product_id)
    .then(response => {
      console.timeEnd('getReviewsMeta');
      res.status(response.status).end(JSON.stringify(response.data));
    })
    .catch(error => res.status(500).message());
});

// POST /reviews
app.post('/reviews', (req, res) => {
  console.time('postReview');
  queries.postReview(req.body)
    .then(response => {
      console.timeEnd('postReview');
      res.status(response.status).send(JSON.stringify(response.message));
    })
    .catch(error => res.status(500));
});

// PUT /reviews/:review_id/helpful
app.put('/reviews/:review_id/helpful', (req, res) => {
  const {
    review_id,
  } = req.params;

  console.time('putReviewHelpful');
  queries.putReviewHelpful(review_id)
    .then(response => {
      console.timeEnd('putReviewHelpful');
      res.status(response.status).send(JSON.stringify(response.message));
    });
});

// PUT /reviews/:review_id/report
app.put('/reviews/:review_id/report', (req, res) => {
  const {
    review_id,
  } = req.params;

  console.time('putReviewReport');
  queries.putReviewReport(review_id)
    .then(response => {
      console.timeEnd('putReviewReport');
      res.status(response.status).send(JSON.stringify(response.message));
    });
});

// Start the server
const server = app.listen(3000, () => console.log('listening on 3000\n'));

module.exports = {
  server,
  db
};
