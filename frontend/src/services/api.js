import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // URL API Gateway
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to log requests and attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // recupera il token salvato al login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', config.url, config.headers);
  return config;
});

// Add response interceptor to log errors
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
