// Shared constants & helpers for Development Trends TanStack cache lookup.
// Preloader (AnalysisPreloader) prefetches the trends payload once with these
// exact filter values. We expose them here so hooks in this feature can
// look up the cached response synchronously via placeholderData.

export const DEV_TRENDS_PRELOADER_FILTERS = {
  timeframe: 'Last 5 Years',
  subject_area: 'All Areas',
  subject_category: 'All Categories',
  zone: 'Global Distribution',
};

// Bump this when the shape or derivation of the shared trends payload changes.
// It prevents persisted query caches from keeping an older empty forecast.
export const DEV_TRENDS_CACHE_VERSION = 'openalex-insights-v2';

export const getPreloadedDevTrends = (queryClient, projectId) => {
  if (!queryClient || !projectId) return undefined;
  // Try exact key first
  const exact = queryClient.getQueryData([
    'developmentTrends',
    DEV_TRENDS_CACHE_VERSION,
    projectId,
    DEV_TRENDS_PRELOADER_FILTERS,
    0,
  ]);
  if (exact) return exact;

  // Only reuse entries from the current payload version.
  const match = queryClient
    .getQueryCache()
    .findAll({ queryKey: ['developmentTrends', DEV_TRENDS_CACHE_VERSION, projectId] })
    .map((q) => q.state.data)
    .find((d) => d !== undefined);
  return match;
};
