import axios from 'axios';

const api = axios.create({
  baseURL: 'https://caresync-project.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('caresync-auth') || '{}');
  const token = auth?.state?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
