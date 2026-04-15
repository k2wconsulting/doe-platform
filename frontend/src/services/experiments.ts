import { apiClient } from './api';
import { ExperimentPlan, ExperimentCreateData } from '../types/experiments';

export const experimentsService = {
  getExperiments: (projectId: number): Promise<ExperimentPlan[]> => 
    apiClient(`/projects/${projectId}/experiments`),
  createExperiment: (projectId: number, data: ExperimentCreateData): Promise<any> => 
    apiClient(`/projects/${projectId}/experiments`, { method: 'POST', body: JSON.stringify(data) }),
  createRun: (experimentId: number, data: any) => 
    apiClient(`/experiments/${experimentId}/runs`, { method: 'POST', body: JSON.stringify(data) }),
  submitResult: (experimentId: number, data: any) => 
    apiClient(`/experiments/${experimentId}/results`, { method: 'POST', body: JSON.stringify(data) }),
  recreateExperimentIteration: (experimentId: number) => 
    apiClient(`/experiments/${experimentId}/new-iteration`, { method: 'POST' }),
  updateExperiment: (experimentId: number, data: any) =>
    apiClient(`/experiments/${experimentId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  clearResults: (experimentId: number) =>
    apiClient(`/experiments/${experimentId}/results`, { method: 'DELETE' }),
};
