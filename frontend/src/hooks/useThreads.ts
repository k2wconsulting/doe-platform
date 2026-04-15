import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { threadsService } from '../services/threads';
import { ThreadCreateData, ThreadMergeData } from '../types/threads';

export function useThreads(projectId: number) {
  return useQuery({
    queryKey: ['threads', projectId],
    queryFn: () => threadsService.getThreads(projectId),
    enabled: !!projectId,
  });
}

export function useCreateThread(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ThreadCreateData) => threadsService.createThread(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads', projectId] });
    },
  });
}

export function useMergeThread(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: number, data: ThreadMergeData }) => 
      threadsService.mergeThread(threadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads', projectId] });
    },
  });
}

export function useUpdateThread(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: number, data: Partial<import('../types/threads').Thread> }) => 
      threadsService.updateThread(threadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threads', projectId] });
    },
  });
}
