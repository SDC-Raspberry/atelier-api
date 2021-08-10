import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

export default function () {
  const low = 900005;
  const high = 1000005;
  const id = Math.floor(Math.random() * (high - low)) + low;
  http.get(`http://localhost:3000/reviews?product_id=${id}`);
  sleep(1);
};
