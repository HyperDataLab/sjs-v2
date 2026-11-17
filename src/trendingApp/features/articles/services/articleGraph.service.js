import apiClient from '../../../shared/api/axios';

const ARTICLE_GRAPH_ENDPOINT = '/articles/search';

export async function searchArticlesGraph({ keyword = 'graph', limit = 50 } = {}) {
  const params = new URLSearchParams();

  params.set('keyword', String(keyword || '').trim());
  params.set('limit', String(Number(limit) || 50));

  const { data } = await apiClient.get(ARTICLE_GRAPH_ENDPOINT, {
    params: Object.fromEntries(params.entries()),
  });

  const payload =
    data?.data && (Array.isArray(data.data.nodes) || Array.isArray(data.data.relationships))
      ? data.data
      : data;

  return {
    source: payload?.source || 'openalex',
    nodes: Array.isArray(payload?.nodes) ? payload.nodes : [],
    relationships: Array.isArray(payload?.relationships)
      ? payload.relationships
      : [],
  };
}
