// Desarrollo (ng serve). Por defecto usa la API de Render para no depender del
// backend local. Para trabajar contra el backend de esta PC, levantar
// "php artisan serve" y cambiar apiUrl a 'http://localhost:8000/api/v1'.
export const environment = {
  production: false,
  apiUrl: 'https://sisacademico-api.onrender.com/api/v1',
};
