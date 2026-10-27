import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message = err.response?.data?.error?.message || 'Network error — is the backend running?';
    if (status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(new Error(message));
  }
);

export default client;
