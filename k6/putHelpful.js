// SERVER 52.41.91.139
// const API_HOST = 'localhost'
const API_HOST = '52.41.91.139'

import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

export default function () {
  const low = 28279;
  const high = 31422;
  const id = Math.floor(Math.random() * (high - low) + low);
  http.put(`http://${API_HOST}/reviews/${id}/helpful`);
  sleep(1);
};
