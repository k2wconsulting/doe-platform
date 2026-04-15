import { apiClient } from './api';
import { Project, ProjectIntakePayload } from '../types/domain';

export const projectsService = {
  getProjects: (): Promise<Project[]> => apiClient('/projects'),
  getProject: (id: number): Promise<Project> => apiClient(`/projects/${id}`),
  createProject: (data: Partial<Project>): Promise<Project> => 
    apiClient('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: Partial<Project>): Promise<Project> => 
    apiClient(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getIntake: (projectId: number) => apiClient(`/projects/${projectId}/intake`),
  saveIntake: (projectId: number, data: ProjectIntakePayload) => 
    apiClient(`/projects/${projectId}/intake`, { method: 'POST', body: JSON.stringify(data) }),
};
