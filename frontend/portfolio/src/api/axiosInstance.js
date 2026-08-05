import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
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
