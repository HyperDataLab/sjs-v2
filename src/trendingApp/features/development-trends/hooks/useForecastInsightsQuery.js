import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDevelopmentTrendsData } from '../services/developmentTrends.service';
import { DEV_TRENDS_CACHE_VERSION, getPreloadedDevTrends } from './devTrendsCache';

export const useForecastInsightsQuery = (projectId, filters = {}, refreshTrigger) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['developmentTrends', DEV_TRENDS_CACHE_VERSION, projectId, filters, refreshTrigger],
    queryFn: () => fetchDevelopmentTrendsData(projectId, filters),
    enabled: !!projectId,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: () => getPreloadedDevTrends(queryClient, projectId),
    select: (response) => {
      const payload = response?.data;
      const insights = payload?.forecastInsights;
      if (Array.isArray(insights) && insights.length) return insights;

      // Keep the forecast section useful when the API has trend data but no
      // separately generated forecast cards (for example older Worker builds).
      const years = (payload?.publicationTrend?.data || [])
        .filter((row) => Number(row?.value) > 0)
        .sort((a, b) => Number(a.year) - Number(b.year));
      const completedYears = years.filter((row) => Number(row.year) < new Date().getFullYear());
      const latest = completedYears.at(-1) || years.at(-1);
      if (!latest) return [];

      const previous = completedYears.find((row) => Number(row.year) === Number(latest.year) - 1);
      const growth = previous
        ? Math.round(((Number(latest.value) - Number(previous.value)) / Number(previous.value)) * 1000) / 10
        : null;
      return [{
        id: 'publication-trend',
        type: 'peak',
        title: 'Publication Trend',
        description: growth === null
          ? `OpenAlex recorded ${Number(latest.value).toLocaleString()} project publications in ${latest.year}.`
          : `OpenAlex recorded ${Number(latest.value).toLocaleString()} project publications in ${latest.year}, ${growth >= 0 ? 'up' : 'down'} ${Math.abs(growth)}% from ${Number(previous.year)}.`,
      }];
    },
  });
};
