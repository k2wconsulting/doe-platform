'use client';

import { useState } from 'react';
import { useThreads, useCreateThread, useMergeThread, useUpdateThread } from '@/hooks/useThreads';
import toast from 'react-hot-toast';
import EmptyState from '@/components/ui/EmptyState';
import { GitBranch, Edit2 } from 'lucide-react';

export default function ThreadsPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { data: threads, isLoading } = useThreads(projectId);
  const createThread = useCreateThread(projectId);
  const mergeThread = useMergeThread(projectId);
  const updateThread = useUpdateThread(projectId);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingThread, setEditingThread] = useState<{id: number, name: string} | null>(null);
  const [mergeTarget, setMergeTarget] = useState<{sourceId: number, targetId: number | null, notes: string} | null>(null);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 bg-slate-100 rounded-md w-48 animate-pulse mb-6" />
      <div className="space-y-4">
        <div className="h-24 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-24 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  );

  const handleCreate = () => {
    if (!newName) return;
    toast.promise(createThread.mutateAsync({ name: newName, description: newDesc }), {
      loading: 'Creating thread...',
      success: () => {
        setIsCreating(false);
        setNewName('');
        setNewDesc('');
        return 'Thread branched successfully';
      },
      error: 'Failed to create thread'
    });
  };

  const handleMerge = () => {
    if (!mergeTarget || !mergeTarget.targetId) return;
    toast.promise(mergeThread.mutateAsync({
      threadId: mergeTarget.sourceId,
      data: {
        target_thread_id: mergeTarget.targetId,
        merge_notes: mergeTarget.notes
      }
    }), {
      loading: 'Merging threads...',
      success: () => {
        setMergeTarget(null);
        return 'Threads merged successfully';
      },
      error: 'Failed to merge threads'
    });
  };

  const handleRename = () => {
    if (!editingThread) return;
    toast.promise(updateThread.mutateAsync({
      threadId: editingThread.id,
      data: { name: editingThread.name }
    }), {
      loading: 'Renaming thread...',
      success: () => {
        setEditingThread(null);
        return 'Thread renamed';
      },
      error: 'Failed to rename'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Project Threads</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            Branch New Thread
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Thread Name</label>
            <input 
              value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
              placeholder="e.g. Iteration B: Reduced Cost"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input 
              value={newDesc} onChange={e => setNewDesc(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
              placeholder="Hypothesis or goal for this fork..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate} disabled={createThread.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {editingThread && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Rename Thread</h3>
            <input 
              title="Thread Name"
              value={editingThread.name}
              onChange={e => setEditingThread({...editingThread, name: e.target.value})}
              className="w-full p-2 border border-slate-300 rounded-md"
            />
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => setEditingThread(null)} className="px-4 py-2 border rounded-md">Cancel</button>
              <button onClick={handleRename} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Dialog */}
      {mergeTarget && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Merge Thread</h3>
            <p className="text-sm text-slate-500">
              Merging <span className="font-semibold text-slate-900">Thread #{mergeTarget.sourceId}</span> into another thread.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-1">Select Target Thread</label>
              <select 
                title="Target Thread"
                value={mergeTarget.targetId || ''}
                onChange={e => setMergeTarget({...mergeTarget, targetId: parseInt(e.target.value)})}
                className="w-full p-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="">-- Choose destination --</option>
                {threads?.filter(t => t.id !== mergeTarget.sourceId).map(t => (
                  <option key={t.id} value={t.id}>{t.name} (ID: {t.id})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Merge Notes</label>
              <textarea 
                value={mergeTarget.notes}
                onChange={e => setMergeTarget({...mergeTarget, notes: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="Document findings or rationale..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
               <button 
                onClick={() => setMergeTarget(null)}
                className="px-4 py-2 border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleMerge} disabled={!mergeTarget.targetId || mergeThread.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
              >
                Confirm Merge
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {threads?.map(thread => (
          <div key={thread.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex justify-between items-center group">
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-lg text-slate-900">{thread.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium border border-slate-200">
                  ID: {thread.id}
                </span>
                {thread.parent_thread_id && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    Forked from #{thread.parent_thread_id}
                  </span>
                )}
                {thread.status === 'merged' && (
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-black border border-orange-200 uppercase tracking-widest shadow-sm">
                    MERGED
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{thread.description || 'No description assigned.'}</p>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setEditingThread({ id: thread.id, name: thread.name })}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"
                title="Rename thread"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setMergeTarget({ sourceId: thread.id, targetId: null, notes: '' })}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium transition"
              >
                Merge Branch
              </button>
            </div>
          </div>
        ))}
        {threads?.length === 0 && (
          <EmptyState 
            icon={GitBranch}
            title="No threads"
            description="Branch a new thread to start a specific line of experimentation."
          />
        )}
      </div>

    </div>
  );
}
