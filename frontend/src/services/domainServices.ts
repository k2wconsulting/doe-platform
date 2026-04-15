import { apiClient } from './api';

export const domainServiceApi = {
  classifyProblem: (projectId: number) => 
    apiClient(`/projects/${projectId}/classify-problem`, { method: 'POST' }),
  auditConstraints: (projectId: number) => 
    apiClient(`/projects/${projectId}/audit-constraints`, { method: 'POST' }),
  recommendDesign: (projectId: number) => 
    apiClient(`/projects/${projectId}/recommend-design`, { method: 'POST' }),
  getResultSummary: (projectId: number) => 
    apiClient(`/projects/${projectId}/result-summary`),
  getNextSteps: (projectId: number) => 
    apiClient(`/projects/${projectId}/next-steps`),
};
