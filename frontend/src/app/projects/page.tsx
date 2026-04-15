'use client';

import { FolderPlus, Edit2, Archive } from 'lucide-react';
import ProjectEditModal from '@/components/projects/ProjectEditModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';
import { useState } from 'react';
import { useProjects, useUpdateProject } from '@/hooks/useProjects';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useProjects();
  const updateProject = useUpdateProject();
  
  const [editingProject, setEditingProject] = useState<any>(null);
  const [archivingId, setArchivingId] = useState<number | null>(null);

  const handleArchive = async () => {
    if (!archivingId) return;
    toast.promise(updateProject.mutateAsync({ 
      id: archivingId, 
      data: { status: 'archived' } 
    }), {
      loading: 'Archiving project...',
      success: () => {
        setArchivingId(null);
        return 'Project archived';
      },
      error: 'Failed to archive'
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-slate-500">Manage your formulation projects.</p>
          </div>
          <Link 
            href="/projects/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
          >
            New Project
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        )}

        {isError && (
          <div className="p-6 border border-red-200 bg-red-50 text-red-600 rounded-xl">
            Failed to load projects. Please try again later.
          </div>
        )}

        {projects?.length === 0 && !isLoading && (
          <EmptyState 
            icon={FolderPlus}
            title="No projects yet"
            description="Get started by creating a new formulation project to define your objectives and constraints."
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects?.map(project => (
            <div key={project.id} className="relative group">
              <Link 
                href={`/projects/${project.id}`}
                className="block"
              >
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="pb-8">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 transition truncate pr-2">
                        {project.name}
                      </h3>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-full shrink-0">
                        {project.status || 'Active'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.preventDefault(); setEditingProject(project); }}
                  className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-indigo-600 shadow-sm"
                  title="Edit details"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => { e.preventDefault(); setArchivingId(project.id); }}
                  className="p-1.5 bg-white border border-slate-200 rounded-md text-slate-500 hover:text-red-600 shadow-sm"
                  title="Archive project"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {editingProject && (
        <ProjectEditModal 
          isOpen={!!editingProject} 
          onClose={() => setEditingProject(null)} 
          project={editingProject} 
        />
      )}

      <ConfirmDialog 
        isOpen={archivingId !== null}
        title="Archive Project"
        message="Are you sure you want to archive this project? It will be removed from your active dashboard. You cannot undo this from the UI currently."
        onConfirm={handleArchive}
        onCancel={() => setArchivingId(null)}
        variant="danger"
        confirmText="Archive Project"
        isLoading={updateProject.isPending}
      />
    </div>
  );
}
