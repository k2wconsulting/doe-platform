'use client';

import { useState } from 'react';
import { useUpdateProject } from '@/hooks/useProjects';
import toast from 'react-hot-toast';

interface ProjectEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: number;
    name: string;
    description: string;
  };
}

export default function ProjectEditModal({ isOpen, onClose, project }: ProjectEditModalProps) {
  const updateProject = useUpdateProject();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    toast.promise(updateProject.mutateAsync({ 
      id: project.id, 
      data: { name, description } 
    }), {
      loading: 'Updating project...',
      success: () => {
        onClose();
        return 'Project updated successfully';
      },
      error: 'Failed to update project'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-4">
        <h3 className="font-bold text-lg">Edit Project Details</h3>
        
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input 
            value={name} onChange={e => setName(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea 
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md h-24"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} disabled={updateProject.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
