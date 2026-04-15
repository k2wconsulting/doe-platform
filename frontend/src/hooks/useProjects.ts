import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../services/projects';
import { Project } from '../types/domain';

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: projectsService.getProjects,
  });
}

export function useProject(id: number) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => projectsService.getProject(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Project> }) => projectsService.updateProject(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
    },
  });
}

export function useSaveIntake() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => projectsService.saveIntake(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['intake', variables.id] });
    },
  });
}

export function useIntake(projectId: number) {
  return useQuery({
    queryKey: ['intake', projectId],
    queryFn: () => projectsService.getIntake(projectId),
    enabled: !!projectId,
  });
}
