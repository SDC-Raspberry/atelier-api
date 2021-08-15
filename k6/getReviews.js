import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

export default function () {
  const low = 28279;
  const high = 31422;
  const id = Math.floor(Math.random() * (high - low)) + low;
  http.get(`http://localhost:3000/reviews?product_id=${id}`);
  sleep(1);
};
