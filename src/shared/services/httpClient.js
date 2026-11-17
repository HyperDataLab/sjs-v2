// httpClient.js
// Axios instance dùng chung cho toàn bộ dự án.
// Tất cả API call đều đi qua đây — không ai gọi axios trực tiếp.

import axios from 'axios';
import { useAuthStore } from '../../app/store/authStore';
import { API_BASE_URL } from './apiBase';

const httpClient = axios.create({
  baseURL: API_BASE_URL,

  // Thời gian chờ tối đa cho request (10 giây) để tránh treo ứng dụng
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ─── Request Interceptor ───────────────────────────────────────────────────
// Tự động đính kèm token vào header mỗi request (nếu có)
httpClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────
// Xử lý lỗi chung — ví dụ 401 thì redirect về login
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Có thể mở rộng thêm sau: toast lỗi, refresh token, v.v.
    return Promise.reject(error);
  }
);

export default httpClient;
