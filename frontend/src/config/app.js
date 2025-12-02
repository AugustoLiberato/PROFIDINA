

// frontend/src/config/app.js

let APP_URL = 'http://10.0.0.161:8080';
//let APP_URL = 'http://10.104.227.116:8080'; //celular
//let APP_URL = 'http://localhost:8080';
// Em produção Vercel vai usar esta URL
if (process.env.NODE_ENV === 'production') {
  APP_URL = 'https://profidina-7y65.vercel.app';
}

export default APP_URL;