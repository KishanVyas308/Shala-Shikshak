import axios from 'axios';

// Use the backend URL - you may need to update this based on your backend deployment
// const API_BASE_URL = 'https://d0bc-2409-40c1-31c8-aa91-f1df-5889-5753-ffa3.ngrok-free.app/api';
export const API_BASE_URL = 'https://494905fe06e0.ngrok-free.app/api';


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
