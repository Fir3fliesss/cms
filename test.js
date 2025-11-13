import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const home = http.get('https://cms-zeta-seven.vercel.app/');
  check(home, { 'home page status is 200': (r) => r.status === 200 });

  sleep(1);

  const article = http.get('https://cms-zeta-seven.vercel.app/article/adolf-hitler-mati-di-garut-4');
  check(article, { 'article page status is 200': (r) => r.status === 200 });

  sleep(1);
}
