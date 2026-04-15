import { apiClient } from './api';
import { FormulationVersion } from '../types/formulations';

export const formulationsService = {
  getFormulations: (projectId: number): Promise<FormulationVersion[]> => 
    apiClient(`/projects/${projectId}/formulations`),
  createFormulation: (projectId: number, data: Partial<FormulationVersion>): Promise<FormulationVersion> => 
    apiClient(`/projects/${projectId}/formulations`, { method: 'POST', body: JSON.stringify(data) }),
  updateFormulation: (formId: number, data: Partial<FormulationVersion>): Promise<FormulationVersion> => 
    apiClient(`/formulations/${formId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  cloneFormulation: (formId: number): Promise<FormulationVersion> => 
    apiClient(`/formulations/${formId}/clone`, { method: 'POST' }),
};
