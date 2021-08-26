// SERVER 52.41.91.139
// const API_HOST = 'localhost'
const API_HOST = '52.41.91.139'

import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

export default function () {
  const low = 900000;
  const high = 1000011;
  const id = Math.floor(Math.random() * (high - low)) + low;
  http.get(`http://${API_HOST}/reviews/meta?product_id=${id}`);
  sleep(1);
};
