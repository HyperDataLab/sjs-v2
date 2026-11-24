import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchDevelopmentTrendsData } from '../services/developmentTrends.service';
import { DEV_TRENDS_CACHE_VERSION, getPreloadedDevTrends } from './devTrendsCache';

export const useTopicEvolutionQuery = (projectId, filters = {}, refreshTrigger) => {
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
    select: (response) => response?.data?.topicEvolution,
  });
};
