import axios from 'axios';

const baseURL = '/api';
console.log('🔌 API Base URL:', baseURL);

export const api = axios.create({
  baseURL,
  validateStatus: (status) => status < 500,
  headers: {
    'Bypass-Tunnel-Reminder': 'true',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => 
  {
    if (error.response?.status === 401) 
    {
        localStorage.removeItem('masjid_display_auth_token');
        localStorage.removeItem('user_info');
        
        if (window.location.pathname !== '/login') 
        {
             window.location.href = '/login';
        }
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => 
  {
    const token = localStorage.getItem('masjid_display_auth_token');

    if (token) 
    {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);