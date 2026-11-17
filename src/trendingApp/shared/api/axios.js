// Analytics pages were originally built against a separate API client. Keep
// their import contract while routing every request through the current
// Firebase-authenticated Worker client.
import api from '../../../shared/services/api';

// The original analytics services consume the JSON response body directly.
// The current application's axios client intentionally returns AxiosResponse,
// so preserve the source contract at this boundary.
const apiClient = {
  get: (...args) => api.get(...args).then(({ data }) => data),
  post: (...args) => api.post(...args).then(({ data }) => data),
  put: (...args) => api.put(...args).then(({ data }) => data),
  patch: (...args) => api.patch(...args).then(({ data }) => data),
  delete: (...args) => api.delete(...args).then(({ data }) => data),
};

export { apiClient };
export const coreApiClient = apiClient;

export default apiClient;
