import { useQuery } from '@tanstack/react-query';
import { fetchDevelopmentTrendsData } from '../services/developmentTrends.service';

export const useCitationMirroringQuery = (projectId, filters = {}, refreshTrigger) => {
  return useQuery({
    // Version the key so persisted pre-OpenAlex/Firestore results are never reused.
    queryKey: ['citationMirroring', 'openalex-v2', projectId, filters, refreshTrigger],
    queryFn: () => fetchDevelopmentTrendsData(projectId, filters),
    enabled: !!projectId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    select: (response) => response?.data?.citationMirroring,
  });
};
