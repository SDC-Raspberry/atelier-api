// SERVER 52.41.91.139
// const API_HOST = 'localhost'
const API_HOST = '52.41.91.139'

import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

const getReviews = {
  low: 28279,
  high: 31422,
  id: () => Math.floor(Math.random() * (getReviews.high - getReviews.low)) + getReviews.low,
};

const getReviewsMeta = {
  low: 900000,
  high: 1000011,
  id: () => Math.floor(Math.random() * (getReviewsMeta.high - getReviewsMeta.low)) + getReviewsMeta.low,
};

const postReview = {
  newReview: {
    product_id: 12,
    rating: 4,
    summary: "I am liking these glasses",
    body: "They are very dark. But that's good because I'm in erysunny spots",
    recommend: false,
    name: "Mister Twister",
    email: "mister@twister.com",
    photos: ["google.com"],
    characteristics: {
      "42": 4,
      "41": 2
    },
  },
  headers: { headers: { 'Content-Type': 'application/json' } },
};

const putHelpful = {
  low: 28279,
  high: 31422,
  id: () => Math.floor(Math.random() * (putHelpful.high - putHelpful.low) + putHelpful.low),
};

const putReport = {
  low: 28279,
  high: 31422,
  id: () => Math.floor(Math.random() * (putReport.high - putReport.low) + putReport.low),
};


export default function () {
  http.get(`http://${API_HOST}/reviews?product_id=${getReviews.id()}`);
  sleep(.2);
  http.get(`http://${API_HOST}/reviews/meta?product_id=${getReviewsMeta.id()}`);
  sleep(.2);
  http.post(`http://${API_HOST}/reviews/`, JSON.stringify(postReview.newReview), postReview.headers);
  sleep(.2);
  http.put(`http://${API_HOST}/reviews/${putHelpful.id()}/helpful`);
  sleep(.2);
  http.put(`http://${API_HOST}/reviews/${putReport.id()}/report`);
  sleep(.2);
};
