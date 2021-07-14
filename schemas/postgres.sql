DROP SCHEMA IF EXISTS reviews CASCADE;

CREATE TABLE IF NOT EXISTS products (
  product_id INT GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  category INT,
  slogan TEXT,
  description TEXT,
  default_price VARCHAR(7),
  PRIMARY KEY(product_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  review_id INT GENERATED ALWAYS AS IDENTITY,
  product_id INT,
  PRIMARY KEY(review_id),
  CONSTRAINT fk_product_id
    FOREIGN KEY(product_id)
      REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS review_photos (
  photo_id INT GENERATED ALWAYS AS IDENTITY,
  review_id INT,
  url TEXT,
  PRIMARY KEY(photo_id),
  CONSTRAINT fk_review_id
    FOREIGN KEY(review_id)
      REFERENCES reviews(review_id)
);

CREATE TABLE IF NOT EXISTS characteristic_ratings (
  rating_id INT GENERATED ALWAYS AS IDENTITY,
  review_id INT,
  characteristic_id INT,
  value INT,
  PRIMARY KEY(rating_id),
  CONSTRAINT fk_review_id
    FOREIGN KEY(review_id)
      REFERENCES reviews(review_id),
  CONSTRAINT fk_characteristic_id
    FOREIGN KEY(characteristic_id)
      REFERENCES characteristics(characteristic_id)
);

CREATE TABLE IF NOT EXISTS characteristics (
  characteristic_id INT GENERATED ALWAYS AS IDENTITY,
  value TEXT,
  PRIMARY KEY(characteristic_id)
);

SELECT * FROM characteristics;
