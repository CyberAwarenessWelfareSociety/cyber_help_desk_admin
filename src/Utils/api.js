// import axios from 'axios';
// import Cookies from 'js-cookie';

// const api = axios.create({
//   baseURL: 'https://api.cyberawareness.ngo/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// api.interceptors.request.use((config) => {
//   const token = Cookies.get('token');
//   const apiKey = Cookies.get('apiKeys'); 

//   // console.log("api key in api : ", apiKey);

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   if (apiKey) {
//     config.headers['x-api-key'] = apiKey;
//   }

//   return config;
// });

// export default api;

import axios from 'axios';
import Cookies from 'js-cookie';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8600/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  const apiKey = Cookies.get('apiKeys');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (apiKey) {
    config.headers['x-api-key'] = apiKey;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // if ([401, 403].includes(status)) {
    //   try {
    //     // Clear cookies or any other auth storage
    //     Cookies.remove('token');
    //     Cookies.remove('apiKeys');
    //      localStorage.removeItem('user');

    //     // Call logout helper if available
    //     // if (logoutCallback) logoutCallback();
    //     // else LogoutHelper();

    //     // Avoid infinite redirect loop
    //     if (window.location.pathname !== '/') {
    //       window.location.href = '/';
    //     }
    //   } catch (err) {
    //     console.error("Error during logout process:", err);
    //   }
    // }

    return Promise.reject(error);
  }
);

export default api;
