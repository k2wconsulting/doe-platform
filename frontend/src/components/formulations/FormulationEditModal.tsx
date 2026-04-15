'use client';

import { useState, useEffect } from 'react';
import { useUpdateFormulation } from '@/hooks/useFormulations';
import toast from 'react-hot-toast';
import { FormulationVersion, FormulationItem } from '@/types/formulations';

interface FormulationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  formulation: FormulationVersion;
}

export default function FormulationEditModal({ isOpen, onClose, formulation }: FormulationEditModalProps) {
  const updateFormulation = useUpdateFormulation(0); // Project ID not strictly needed for the mutation itself
  const [name, setName] = useState(formulation?.name || '');
  const [items, setItems] = useState<FormulationItem[]>([]);

  useEffect(() => {
    if (formulation) {
      setName(formulation.name);
      setItems(formulation.items || []);
    }
  }, [formulation]);

  if (!isOpen || !formulation) return null;

  const handleSubmit = async () => {
    if (formulation.status !== 'draft') {
      toast.error('Only draft formulations can be edited directly.');
      return;
    }

    toast.promise(updateFormulation.mutateAsync({ 
      id: formulation.id, 
      data: { name, items } 
    }), {
      loading: 'Saving corrections...',
      success: () => {
        onClose();
        return 'Formulation updated';
      },
      error: 'Failed to update formulation'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full space-y-4 my-8">
        <h3 className="font-bold text-lg">Edit Draft Formulation</h3>
        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 italic">
          You are editing Version {formulation.version_number}. Direct edits are only allowed because this version is still in "Draft" state.
        </p>
        
        <div>
          <label className="block text-sm font-medium mb-1">Formulation Name</label>
          <input 
            value={name} onChange={e => setName(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
          />
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium">Ingredients</label>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex space-x-2">
                <input 
                  placeholder="Role"
                  value={item.role}
                  onChange={e => {
                    const newI = [...items];
                    newI[idx].role = e.target.value;
                    setItems(newI);
                  }}
                  className="flex-1 p-2 border rounded text-sm"
                />
                <input 
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={e => {
                    const newI = [...items];
                    newI[idx].amount = parseFloat(e.target.value);
                    setItems(newI);
                  }}
                  className="w-24 p-2 border rounded text-sm"
                />
                <select
                  value={item.unit}
                  onChange={e => {
                    const newI = [...items];
                    newI[idx].unit = e.target.value;
                    setItems(newI);
                  }}
                  className="w-20 p-2 border rounded text-sm bg-white"
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="mL">mL</option>
                  <option value="%">%</option>
                </select>
                <button 
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="px-2 text-red-500 hover:bg-red-50 rounded"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setItems([...items, { role: '', amount: 0, unit: 'g' }])}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            + Add item
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} disabled={updateFormulation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            Save Corrections
          </button>
        </div>
      </div>
    </div>
  );
}
