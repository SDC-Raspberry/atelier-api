// Initialize Server
const express = require('express');
const app = express();

const db = require('./db');

//
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

// Start the server
app.listen(3000, () => console.log('listening on 3000\n'));
