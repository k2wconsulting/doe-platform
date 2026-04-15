import { useQuery, useMutation } from '@tanstack/react-query';
import { domainServiceApi } from '../services/domainServices';

export function useDomainInsights(projectId: number) {
  return useQuery({
    queryKey: ['domainInsights', projectId],
    queryFn: async () => {
      const [classify, audit, recommend, summary, nextSteps] = await Promise.all([
        domainServiceApi.classifyProblem(projectId),
        domainServiceApi.auditConstraints(projectId),
        domainServiceApi.recommendDesign(projectId),
        domainServiceApi.getResultSummary(projectId),
        domainServiceApi.getNextSteps(projectId)
      ]);
      
      return {
        classify,
        audit,
        recommend,
        summary,
        nextSteps
      };
    },
    enabled: !!projectId,
    staleTime: 0 // Always fetch fresh to reflect recent edits
  });
}
