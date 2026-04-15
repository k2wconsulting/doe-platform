import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formulationsService } from '../services/formulations';
import { FormulationVersion } from '../types/formulations';

export function useFormulations(projectId: number) {
  return useQuery<FormulationVersion[]>({
    queryKey: ['formulations', projectId],
    queryFn: () => formulationsService.getFormulations(projectId),
    enabled: !!projectId,
  });
}

export function useCreateFormulation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<FormulationVersion>) => formulationsService.createFormulation(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulations', projectId] });
    },
  });
}

export function useUpdateFormulation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<FormulationVersion> }) => formulationsService.updateFormulation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulations', projectId] });
    },
  });
}

export function useCloneFormulation(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => formulationsService.cloneFormulation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formulations', projectId] });
    },
  });
}
