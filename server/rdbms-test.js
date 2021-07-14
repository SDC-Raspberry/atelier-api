const express = require('express');
var pg = require('pg');
var format = require('pg-format');

const app = express();

var PGUSER = 'oldsilverboi';
var PGDATABASE = 'oldsilverboi';

var config = {
  user: PGUSER, // name of the user account
  database: PGDATABASE, // name of the database
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
};

var pool = new pg.Pool(config);

pool.connect(function (err, client, done) {
  if (err) console.log(err);
  app.listen(3000, function () {
    console.log('listening on 3000')
  });
  const newProduct = `
    INSERT INTO
      products
      (name, category, slogan, description, default_price)
    VALUES
      ('Test', 1, 'thing', 'big thing', '100');
  `;
  const getProducts = 'SELECT * FROM products';
  client.query(newProduct, function (err, result) {
    if (err) {
      console.log(err);
    }
    console.log(result);
    client.query(getProducts, function (err, result) {
      if (err) {
        console.log(err);
      }
      console.log(result.rows[0]);
    });
  });
});