import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { experimentsService } from '../services/experiments';
import { ExperimentCreateData } from '../types/experiments';

export function useExperiments(projectId: number) {
  return useQuery({
    queryKey: ['experiments', projectId],
    queryFn: () => experimentsService.getExperiments(projectId),
    enabled: !!projectId,
  });
}

export function useCreateExperiment(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ExperimentCreateData) => experimentsService.createExperiment(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}

export function useCreateRun(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experimentId, data }: { experimentId: number, data: any }) => 
      experimentsService.createRun(experimentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}

export function useSubmitResult(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experimentId, data }: { experimentId: number, data: any }) => 
      experimentsService.submitResult(experimentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}

export function useNewExperimentIteration(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: number) => experimentsService.recreateExperimentIteration(experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}
export function useUpdateExperiment(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ experimentId, data }: { experimentId: number, data: any }) => 
      experimentsService.updateExperiment(experimentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}

export function useClearExperimentResults(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (experimentId: number) => experimentsService.clearResults(experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', projectId] });
    },
  });
}
