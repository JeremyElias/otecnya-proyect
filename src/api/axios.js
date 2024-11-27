import axios from 'axios';

// Configurar Axios para enviar el token de autorización en todas las solicitudes
const token = localStorage.getItem('accessToken');
if (token) {
  axios.defaults.headers['Authorization'] = `Bearer ${token}`;
}

// Crear instancia de Axios para personalizar la configuración
export default axios.create({
  baseURL: 'http://localhost:5000', // Ajusta la URL base según tu servidor
});
