'use client';

import { useState } from 'react';
import { useFormulations, useCreateFormulation, useCloneFormulation, useUpdateFormulation } from '@/hooks/useFormulations';
import { FormulationItem } from '@/types/formulations';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Beaker, Copy, Archive, Edit2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import FormulationEditModal from '@/components/formulations/FormulationEditModal';

export default function FormulationsPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { data: formulations, isLoading } = useFormulations(projectId);
  const createFormulation = useCreateFormulation(projectId);
  const cloneFormulation = useCloneFormulation(projectId);
  const updateFormulation = useUpdateFormulation(projectId);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [items, setItems] = useState<FormulationItem[]>([
    { role: '', amount: 0, unit: 'g' }
  ]);
  const [editingFormulation, setEditingFormulation] = useState<any>(null);
  const [archiveId, setArchiveId] = useState<number | null>(null);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 bg-slate-100 rounded-md w-48 animate-pulse mb-6" />
      <div className="h-64 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
      <div className="h-64 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
    </div>
  );

  const handleCreate = () => {
    if (!newName) return;
    toast.promise(createFormulation.mutateAsync({
      name: newName,
      items,
      procedures: []
    }), {
      loading: 'Saving formulation...',
      success: () => {
        setIsCreating(false);
        setNewName('');
        setItems([{ role: '', amount: 0, unit: 'g' }]);
        return 'Formulation created successfully';
      },
      error: 'Failed to create formulation'
    });
  };

  const handleClone = (id: number) => {
    toast.promise(cloneFormulation.mutateAsync(id), {
      loading: 'Cloning formulation...',
      success: 'Formulation cloned successfully',
      error: 'Failed to clone formulation'
    });
  };

  const handleArchive = () => {
    if (!archiveId) return;
    toast.promise(updateFormulation.mutateAsync({ id: archiveId, data: { status: 'archived' } }), {
      loading: 'Archiving...',
      success: () => {
        setArchiveId(null);
        return 'Formulation archived';
      },
      error: 'Failed to archive'
    });
  };

  const handleFinalize = (id: number) => {
    toast.promise(updateFormulation.mutateAsync({ id: id, data: { status: 'finalized' } }), {
      loading: 'Finalizing recipe...',
      success: 'Recipe finalized and locked.',
      error: 'Failed to finalize'
    });
  };

  const handleCloneAndEdit = async (id: number) => {
    toast.promise(cloneFormulation.mutateAsync(id), {
      loading: 'Preparing editable clone...',
      success: (newForm) => {
        setEditingFormulation(newForm);
        return 'Cloned for correction';
      },
      error: 'Failed to clone'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Formulations</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Create Base Formulation
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Formulation Name</label>
            <input 
              value={newName} onChange={e => setNewName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md"
              placeholder="e.g. Master Batch V1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Ingredients / Items</label>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex space-x-3 items-center">
                  <input 
                    placeholder="Role / Material (e.g. Resin A)"
                    value={item.role}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].role = e.target.value;
                      setItems(newItems);
                    }}
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
                  />
                  <input 
                    type="number"
                    placeholder="Amount"
                    value={item.amount || ''}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].amount = parseFloat(e.target.value);
                      setItems(newItems);
                    }}
                    className="w-24 p-2 border border-slate-300 rounded-md text-sm"
                  />
                  <select 
                    value={item.unit}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[idx].unit = e.target.value;
                      setItems(newItems);
                    }}
                    className="w-20 p-2 border border-slate-300 rounded-md text-sm bg-white"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="mL">mL</option>
                    <option value="%">%</option>
                  </select>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setItems([...items, { role: '', amount: 0, unit: 'g' }])}
              className="mt-3 text-sm text-indigo-600 font-medium hover:underline"
            >
              + Add Item
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreate} disabled={createFormulation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              Save Formulation
            </button>
          </div>
        </div>
      )}

      {formulations?.length === 0 && !isCreating && (
        <EmptyState 
          icon={Beaker}
          title="No formulations"
          description="Create your first base formulation to start experimenting."
        />
      )}

      <div className="grid grid-cols-1 gap-6">
        {formulations?.map(f => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{f.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Version {f.version_number}
                  {f.thread_id ? ` • Thread #${f.thread_id}` : ''}
                  {f.parent_version_id ? ` • Cloned from #${f.parent_version_id}` : ''}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter ${f.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {f.status}
                </span>
                
                {f.status === 'draft' ? (
                  <>
                    <button 
                      onClick={() => setEditingFormulation(f)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition"
                      title="Edit component amounts"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleFinalize(f.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition border border-green-200"
                      title="Finalize recipe"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleCloneAndEdit(f.id)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center space-x-1"
                    title="Clone to new draft to edit"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-[10px] font-bold">RE-VERSION</span>
                  </button>
                )}

                <button 
                  onClick={() => setArchiveId(f.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded transition"
                  title="Archive formulation"
                >
                  <Archive className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Role / Component</th>
                    <th className="px-6 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {f.items?.map(item => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.role}</td>
                      <td className="px-6 py-4">{item.amount} {item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <FormulationEditModal 
        isOpen={!!editingFormulation}
        onClose={() => setEditingFormulation(null)}
        formulation={editingFormulation}
      />

      <ConfirmDialog 
        isOpen={archiveId !== null}
        title="Archive Formulation"
        message="Are you sure you want to archive this formulation? It will be removed from your active formulations list."
        onConfirm={handleArchive}
        onCancel={() => setArchiveId(null)}
        confirmText="Archive Formulation"
        variant="danger"
        isLoading={updateFormulation.isPending}
      />
    </div>
  );
}
