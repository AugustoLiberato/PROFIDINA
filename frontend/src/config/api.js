// const API_URL = import.meta.env.MODE === 'production' 
//   ? 'https://profidina-backend.onrender.com'  // Backend no Render
//   : 'http://localhost:3000';                   // Backend local

// export default API_URL;

// // Log para debug (apenas em desenvolvimento)
// if (import.meta.env.MODE === 'development') {
//   console.log('🔗 API URL:', API_URL);
// }

// src/config/api.js
// frontend/src/config/api.js

let API_URL = 'http://localhost:3000';

// Em produção (Vercel), ele vai usar esta URL "chumbada"
if (process.env.NODE_ENV === 'production') {
  // Coloque a URL do seu backend do Render aqui
  API_URL = 'https://profidina-backend.onrender.com'; //  esta é sua URL correta!
}

export default API_URL;
