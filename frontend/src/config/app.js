

// frontend/src/config/app.js

let APP_URL = 'http://localhost:8080';

// Em produção (Vercel), ele vai usar esta URL
if (process.env.NODE_ENV === 'production') {
  APP_URL = 'https://profidina-7y65.vercel.app';
}

export default APP_URL;