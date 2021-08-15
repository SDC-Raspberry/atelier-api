import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
  duration: '30s',
};

const choices = [2, 6, 18, 19, 20];

export default function () {
  const id = Math.floor(Math.random() * choices.length);
  http.put(`http://localhost:3000/reviews/${choices[id]}/report`);
  sleep(1);
};
