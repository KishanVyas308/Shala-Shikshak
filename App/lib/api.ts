import axios from 'axios';

// Use the backend URL - you may need to update this based on your backend deployment
// export const API_BASE_URL = 'https://ba98b0577ea7.ngrok-free.app/api';
// export const API_BASE_URL = 'https://api.shalashikshak.in/api';
export const API_BASE_URL = 'http://192.168.0.100:4000/api';



export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
