import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

const newReview = {
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
};

const headers = { headers: { 'Content-Type': 'application/json' } };

export default function () {
  http.post(`http://localhost:3000/reviews/`, JSON.stringify(newReview), headers);
  sleep(1);
};
