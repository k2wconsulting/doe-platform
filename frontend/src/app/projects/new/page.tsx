'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProject, useSaveIntake } from '@/hooks/useProjects';
import toast from 'react-hot-toast';

export default function NewProjectWizard() {
  const router = useRouter();
  const createProject = useCreateProject();
  const saveIntake = useSaveIntake();

  const [step, setStep] = useState(1);
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    has_prior_data: false,
    workflow_preference: 'ai_generated',
  });

  const [intakeData, setIntakeData] = useState({
    objectives: [{ parameter: '', target_value: 0, direction: 'maximize', weight: 1 }],
    constraints: [{ constraint_type: 'cost', description: '', limit_value: 0, operator: '<=' }]
  });

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);

  const handleSubmit = async () => {
    const doCreate = async () => {
      const proj = await createProject.mutateAsync(projectData);
      await saveIntake.mutateAsync({ id: proj.id, data: intakeData });
      return proj.id;
    };

    toast.promise(doCreate(), {
      loading: 'Creating project...',
      success: (id) => {
        if (id) {
          router.push(`/projects/${id}`);
          return 'Project created successfully!';
        } else {
          router.push('/projects');
          return 'Project created, but could not navigate to details.';
        }
      },
      error: 'Failed to create project'
    });
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">New Project</h1>
          <p className="text-slate-500">Step {step} of 2</p>
        </div>

        {step === 1 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input 
                value={projectData.name}
                onChange={e => setProjectData({...projectData, name: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="e.g. High Temp Resin 2.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                value={projectData.description}
                onChange={e => setProjectData({...projectData, description: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md h-24"
                placeholder="Describe the goal of this formulation..."
              />
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <button 
                onClick={handleNext}
                disabled={!projectData.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">Initial Intake</h3>
            
            <div className="space-y-4">
              <label className="block text-sm font-medium">Primary Objective</label>
              <div className="grid grid-cols-3 gap-4">
                <input 
                  placeholder="Parameter (e.g. Viscosity)"
                  value={intakeData.objectives[0].parameter}
                  onChange={e => {
                    const newObjs = [...intakeData.objectives];
                    newObjs[0].parameter = e.target.value;
                    setIntakeData({...intakeData, objectives: newObjs});
                  }}
                  className="p-2 border rounded-md"
                />
                <input 
                  type="number"
                  placeholder="Target Value"
                  value={intakeData.objectives[0].target_value}
                  onChange={e => {
                    const newObjs = [...intakeData.objectives];
                    newObjs[0].target_value = parseFloat(e.target.value);
                    setIntakeData({...intakeData, objectives: newObjs});
                  }}
                  className="p-2 border rounded-md"
                />
                <select
                  value={intakeData.objectives[0].direction}
                  onChange={e => {
                    const newObjs = [...intakeData.objectives];
                    newObjs[0].direction = e.target.value;
                    setIntakeData({...intakeData, objectives: newObjs});
                  }}
                  className="p-2 border rounded-md bg-white"
                >
                  <option value="maximize">Maximize</option>
                  <option value="minimize">Minimize</option>
                  <option value="target">Hit Target</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <label className="block text-sm font-medium">Key Constraint</label>
              <div className="grid grid-cols-4 gap-4">
                <select
                  value={intakeData.constraints[0].constraint_type}
                  onChange={e => {
                    const newC = [...intakeData.constraints];
                    newC[0].constraint_type = e.target.value;
                    setIntakeData({...intakeData, constraints: newC});
                  }}
                  className="p-2 border rounded-md bg-white"
                >
                  <option value="cost">Cost</option>
                  <option value="regulatory">Regulatory</option>
                  <option value="processing">Processing</option>
                </select>
                <input 
                  placeholder="Limit Value"
                  type="number"
                  value={intakeData.constraints[0].limit_value}
                  onChange={e => {
                    const newC = [...intakeData.constraints];
                    newC[0].limit_value = parseFloat(e.target.value);
                    setIntakeData({...intakeData, constraints: newC});
                  }}
                  className="p-2 border rounded-md"
                />
                <select
                  value={intakeData.constraints[0].operator}
                  onChange={e => {
                    const newC = [...intakeData.constraints];
                    newC[0].operator = e.target.value;
                    setIntakeData({...intakeData, constraints: newC});
                  }}
                  className="p-2 border rounded-md bg-white"
                >
                  <option value="<=">&lt;=</option>
                  <option value=">=">&gt;=</option>
                  <option value="=">=</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <button 
                onClick={handleBack}
                className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={createProject.isPending || saveIntake.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
              >
                {createProject.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
