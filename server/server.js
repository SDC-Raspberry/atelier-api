// Initialize Server
const express = require('express');
const app = express();

const db = require('./db');

app.get('/', (req, res) => {
  db.getAllProducts()
    .then(result => res.end(JSON.stringify(result)));
});

// Start the server
app.listen(3000, () => console.log('listening on 3000\n'));
