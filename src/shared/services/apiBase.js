const configuredApiUrl =
  import.meta.env.VITE_WORKER_API_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:43877/api/v1';

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');
