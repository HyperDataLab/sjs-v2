import api from '../../../shared/services/api';

/** Search the system catalog across articles, authors, journals and related entities. */
export const searchSystemApi = (query, limit = 8) =>
  api.get('/search', { params: { q: query, type: 'all', page: 1, limit } });
