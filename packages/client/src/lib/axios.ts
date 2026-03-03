import axios from 'axios';

let baseURL = '/api';
if (import.meta.env.PROD && import.meta.env.VITE_API_URL) 
{
  const apiUrl = import.meta.env.VITE_API_URL as string;
  baseURL = apiUrl.endsWith('/api') ? apiUrl : apiUrl.replace(/\/$/, '') + '/api';
}

export const api = axios.create({
  baseURL,
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
        
        if (window.location.pathname !== '/display/login') 
        {
             window.location.href = '/display/login';
        }
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => 
  {
    const token = localStorage.getItem('masjid_display_auth_token');

    if (token && token !== 'undefined' && token !== 'null') 
    {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);