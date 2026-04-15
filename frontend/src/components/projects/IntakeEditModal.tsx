'use client';

import { useState, useEffect } from 'react';
import { useSaveIntake, useIntake } from '@/hooks/useProjects';
import toast from 'react-hot-toast';
import { ProjectObjective, ProjectConstraint } from '@/types/domain';

interface IntakeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
}

export default function IntakeEditModal({ isOpen, onClose, projectId }: IntakeEditModalProps) {
  const { data: currentIntake } = useIntake(projectId);
  const saveIntake = useSaveIntake();

  const [objectives, setObjectives] = useState<ProjectObjective[]>([]);
  const [constraints, setConstraints] = useState<ProjectConstraint[]>([]);

  useEffect(() => {
    if (currentIntake) {
      setObjectives(currentIntake.objectives || []);
      setConstraints(currentIntake.constraints || []);
    }
  }, [currentIntake]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    toast.promise(saveIntake.mutateAsync({ 
      id: projectId, 
      data: { objectives, constraints } 
    }), {
      loading: 'Saving updated goals...',
      success: () => {
        onClose();
        return 'Goals updated successfully';
      },
      error: 'Failed to update goals'
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 overflow-y-auto pt-20">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl w-full space-y-6 my-8">
        <h3 className="font-bold text-lg border-b pb-2">Edit Project Goals & Constraints</h3>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
          {/* Objectives Section */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Primary Objectives</h4>
            <div className="space-y-3">
              {objectives.map((obj, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Parameter</label>
                    <input 
                      value={obj.parameter}
                      onChange={e => {
                        const newObjs = [...objectives];
                        newObjs[idx].parameter = e.target.value;
                        setObjectives(newObjs);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Target Value</label>
                    <input 
                      type="number"
                      value={obj.target_value ?? 0}
                      onChange={e => {
                        const newObjs = [...objectives];
                        newObjs[idx].target_value = parseFloat(e.target.value);
                        setObjectives(newObjs);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-sm"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Direction</label>
                    <select
                      value={obj.direction ?? 'target'}
                      onChange={e => {
                        const newObjs = [...objectives];
                        newObjs[idx].direction = e.target.value;
                        setObjectives(newObjs);
                      }}
                      className="w-full p-2 border border-slate-300 rounded text-sm bg-white"
                    >
                      <option value="maximize">Maximize</option>
                      <option value="minimize">Minimize</option>
                      <option value="target">Hit Target</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setObjectives(objectives.filter((_, i) => i !== idx))}
                    className="h-9 px-3 text-red-500 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setObjectives([...objectives, { parameter: '', target_value: 0, direction: 'target', weight: 1 }])}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              + Add Objective
            </button>
          </div>

          {/* Constraints Section */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-slate-800">Operational Constraints</h4>
            <div className="space-y-3">
              {constraints.map((con, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-3 items-end p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-red-400">Type</label>
                    <select
                      value={con.constraint_type ?? 'cost'}
                      onChange={e => {
                        const newC = [...constraints];
                        newC[idx].constraint_type = e.target.value;
                        setConstraints(newC);
                      }}
                      className="w-full p-2 border border-red-200 rounded text-sm bg-white"
                    >
                      <option value="cost">Cost</option>
                      <option value="regulatory">Regulatory</option>
                      <option value="processing">Processing</option>
                      <option value="physical">Physical Boundary</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-red-400">Operator</label>
                    <select
                      value={con.operator ?? '<='}
                      onChange={e => {
                        const newC = [...constraints];
                        newC[idx].operator = e.target.value;
                        setConstraints(newC);
                      }}
                      className="w-full p-2 border border-red-200 rounded text-sm bg-white"
                    >
                      <option value="<=">&lt;=</option>
                      <option value=">=">&gt;=</option>
                      <option value="=">=</option>
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase font-bold text-red-400">Value</label>
                    <input 
                      type="number"
                      value={con.limit_value ?? 0}
                      onChange={e => {
                        const newC = [...constraints];
                        newC[idx].limit_value = parseFloat(e.target.value);
                        setConstraints(newC);
                      }}
                      className="w-full p-2 border border-red-200 rounded text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => setConstraints(constraints.filter((_, i) => i !== idx))}
                    className="h-9 px-3 text-red-500 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setConstraints([...constraints, { constraint_type: 'cost', description: '', limit_value: 0, operator: '<=' }])}
              className="text-sm text-red-600 font-medium hover:underline"
            >
              + Add Constraint
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} disabled={saveIntake.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            {saveIntake.isPending ? 'Saving...' : 'Save updated goals'}
          </button>
        </div>
      </div>
    </div>
  );
}
