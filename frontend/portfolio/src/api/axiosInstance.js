import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    console.warn('[API Error]', error?.config?.url, error?.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
