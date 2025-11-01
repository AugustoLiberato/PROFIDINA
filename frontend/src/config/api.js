// frontend/src/config/api.js

let API_URL = 'http://localhost:3000';

// Em produção (Vercel), ele vai usar esta URL "chumbada"
if (process.env.NODE_ENV === 'production') {
  // Coloque a URL do seu backend do Render aqui
  API_URL = 'https://profidina-backend.onrender.com'; // Esta é sua URL correta!
}

export default API_URL;