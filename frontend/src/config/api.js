// frontend/src/config/api.js

//let API_URL = 'http://localhost:3000';
let API_URL = 'http://10.0.0.161:3000';

if (process.env.NODE_ENV === 'production') {

  API_URL = 'https://profidina-backend.onrender.com'; // 
}

export default API_URL;