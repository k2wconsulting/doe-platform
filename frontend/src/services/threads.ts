import { apiClient } from './api';
import { Thread, ThreadCreateData, ThreadMergeData } from '../types/threads';

export const threadsService = {
  getThreads: (projectId: number): Promise<Thread[]> => 
    apiClient(`/projects/${projectId}/threads`),
  createThread: (projectId: number, data: ThreadCreateData): Promise<Thread> => 
    apiClient(`/projects/${projectId}/threads`, { method: 'POST', body: JSON.stringify(data) }),
  mergeThread: (threadId: number, data: ThreadMergeData) => 
    apiClient(`/threads/${threadId}/merge`, { method: 'POST', body: JSON.stringify(data) }),
  updateThread: (threadId: number, data: Partial<Thread>): Promise<Thread> => 
    apiClient(`/threads/${threadId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};
