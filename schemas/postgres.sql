DROP SCHEMA IF EXISTS reviews CASCADE;

CREATE TABLE IF NOT EXISTS products (
  id INT GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  slogan TEXT,
  description TEXT,
  category INT,
  default_price VARCHAR(7),
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT GENERATED ALWAYS AS IDENTITY,
  product_id INT,
  rating INT,
  date INT,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT,
  helpfulness INT,
  PRIMARY KEY(id),
  CONSTRAINT fk_product_id
    FOREIGN KEY(product_id)
      REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS review_photos (
  id INT GENERATED ALWAYS AS IDENTITY,
  review_id INT,
  url TEXT,
  PRIMARY KEY(id),
  CONSTRAINT fk_review_id
    FOREIGN KEY(review_id)
      REFERENCES reviews(review_id)
);

CREATE TABLE IF NOT EXISTS characteristic_ratings (
  id INT GENERATED ALWAYS AS IDENTITY,
  characteristic_id INT,
  review_id INT,
  value INT,
  PRIMARY KEY(id),
  CONSTRAINT fk_review_id
    FOREIGN KEY(review_id)
      REFERENCES reviews(review_id),
  CONSTRAINT fk_characteristic_id
    FOREIGN KEY(characteristic_id)
      REFERENCES characteristics(characteristic_id)
);

CREATE TABLE IF NOT EXISTS characteristics (
  id INT GENERATED ALWAYS AS IDENTITY,
  product_id INT,
  value TEXT,
  PRIMARY KEY(id)
);
