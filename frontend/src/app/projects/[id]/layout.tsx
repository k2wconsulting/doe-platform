'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { Settings, Archive } from 'lucide-react';

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const id = parseInt(params.id);
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });

  const openEdit = () => {
    if (project) {
        setEditData({ name: project.name, description: project.description });
        setIsEditOpen(true);
    }
  };

  const handleSave = () => {
    toast.promise(updateProject.mutateAsync({ id, data: editData }), {
      loading: 'Saving changes...',
      success: () => {
        setIsEditOpen(false);
        return 'Project updated successfully';
      },
      error: 'Failed to update project',
    });
  };

  const handleArchive = () => {
    toast.promise(updateProject.mutateAsync({ id, data: { status: 'archived' } }), {
      loading: 'Archiving project...',
      success: () => {
        setIsArchiveConfirmOpen(false);
        router.push('/projects');
        return 'Project archived';
      },
      error: 'Failed to archive project',
    });
  };

  const tabs = [
    { name: 'Overview & Intake', href: `/projects/${id}` },
    { name: 'Formulations', href: `/projects/${id}/formulations` },
    { name: 'Threads', href: `/projects/${id}/threads` },
    { name: 'Experiments', href: `/projects/${id}/experiments` },
  ];

  if (isLoading) {
    return <div className="p-8 animate-pulse text-slate-500">Loading project workspace...</div>;
  }

  if (!project) {
    return <div className="p-8 text-red-500">Project not found.</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-8 py-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{project.name}</h1>
            <p className="text-slate-500 text-sm max-w-2xl">{project.description}</p>
          </div>
          <div className="flex space-x-3 items-center">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-sm rounded-full font-medium">
              {project.status || 'Active'}
            </span>
            <button 
              onClick={openEdit}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition"
              title="Project Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsArchiveConfirmOpen(true)}
              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
              title="Archive Project"
            >
              <Archive className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-8 mt-8 border-b border-transparent">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-4">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input 
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md bg-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-md h-24 bg-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!editData.name || updateProject.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {updateProject.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={isArchiveConfirmOpen}
        title="Archive Project"
        message={`Are you sure you want to archive "${project.name}"? It will be hidden from the active projects list, but its data will not be permanently deleted.`}
        confirmText="Archive Project"
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveConfirmOpen(false)}
        variant="danger"
        isLoading={updateProject.isPending}
      />
    </div>
  );
}
