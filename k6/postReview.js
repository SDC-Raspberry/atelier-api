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

export default function () {
  const low = 900000;
  const high = 1000011;
  const id = Math.floor(Math.random() * (high - low)) + low;
  http.post(`http://localhost:3000/reviews/`, newReview);
  sleep(1);
};
