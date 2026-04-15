'use client';

import { useState } from 'react';
import { useExperiments, useCreateExperiment, useCreateRun, useSubmitResult, useNewExperimentIteration, useUpdateExperiment, useClearExperimentResults } from '@/hooks/useExperiments';
import { ResponseDefinition } from '@/types/experiments';
import toast from 'react-hot-toast';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TestTube, Copy, RotateCcw, CheckCircle, Trash2 } from 'lucide-react';

export default function ExperimentsPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id);
  const { data: experiments, isLoading } = useExperiments(projectId);
  
  const createExp = useCreateExperiment(projectId);
  const createRun = useCreateRun(projectId);
  const submitResult = useSubmitResult(projectId);
  const newIteration = useNewExperimentIteration(projectId);
  const updateExp = useUpdateExperiment(projectId);
  const clearResults = useClearExperimentResults(projectId);

  const [isCreating, setIsCreating] = useState(false);
  const [newExp, setNewExp] = useState({ name: '', design_type: 'full_factorial' });
  const [responses, setResponses] = useState<ResponseDefinition[]>([{ name: '', unit: '', type: 'continuous' }]);

  const [expandedExpId, setExpandedExpId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);

  const [newResultValue, setNewResultValue] = useState<{ [key: string]: string }>({});

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-10 bg-slate-100 rounded-md w-48 animate-pulse mb-6" />
      <div className="space-y-6">
        <div className="h-48 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-48 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
      </div>
    </div>
  );

  const handleCreatePlan = () => {
    toast.promise(createExp.mutateAsync({
      name: newExp.name,
      design_type: newExp.design_type,
      responses: responses.filter(r => r.name)
    }), {
      loading: 'Generating protocol...',
      success: () => {
        setIsCreating(false);
        setNewExp({ name: '', design_type: 'full_factorial' });
        setResponses([{ name: '', unit: '', type: 'continuous' }]);
        return 'Experimental plan created';
      },
      error: 'Failed to formulate plan'
    });
  };

  const handleAddRun = (expId: number) => {
    toast.promise(createRun.mutateAsync({ experimentId: expId, data: { status: 'pending' } }), {
      loading: 'Adding run...',
      success: 'New run added',
      error: 'Failed to add run'
    });
  };

  const handleSubmitResult = (expId: number, runId: number, responseId: number) => {
    const val = parseFloat(newResultValue[`${runId}_${responseId}`]);
    if (isNaN(val)) return;

    toast.promise(submitResult.mutateAsync({
      experimentId: expId,
      data: { run_id: runId, response_id: responseId, value: val }
    }), {
      loading: 'Saving result...',
      success: () => {
        setNewResultValue(prev => ({...prev, [`${runId}_${responseId}`]: ''}));
        return 'Result saved';
      },
      error: 'Failed to save result'
    });
  };

  const handleNewIteration = (expId: number) => {
    toast.promise(newIteration.mutateAsync(expId), {
      loading: 'Creating new iteration...',
      success: 'New iteration created successfully',
      error: 'Failed to create iteration'
    });
  };

  const handleFinalizePlan = (expId: number) => {
    toast.promise(updateExp.mutateAsync({ experimentId: expId, data: { status: 'finalized' } }), {
      loading: 'Finalizing protocol...',
      success: 'Protocol finalized and locked.',
      error: 'Failed to finalize'
    });
  };

  const handleResetResults = () => {
    if (!resettingId) return;
    toast.promise(clearResults.mutateAsync(resettingId), {
      loading: 'Clearing results...',
      success: () => {
        setResettingId(null);
        return 'Results cleared and status reset to scheduled.';
      },
      error: 'Failed to clear results'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Experimental Designs</h2>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Design New Plan
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm space-y-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Experiment Name</label>
              <input 
                value={newExp.name} onChange={e => setNewExp({...newExp, name: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md"
                placeholder="e.g. Viscosity Factorial Optimization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Design Framework</label>
              <select 
                value={newExp.design_type} onChange={e => setNewExp({...newExp, design_type: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-md bg-white"
              >
                <option value="full_factorial">Full Factorial</option>
                <option value="response_surface">Response Surface</option>
                <option value="mixture">Mixture</option>
                <option value="custom">Custom / Screening</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tracked Responses (Outputs)</label>
            <div className="space-y-3">
              {responses.map((resp, idx) => (
                <div key={idx} className="flex space-x-3 items-center">
                  <input 
                    placeholder="Output Parameter (e.g. Yield Stress)"
                    value={resp.name}
                    onChange={e => {
                      const newResp = [...responses];
                      newResp[idx].name = e.target.value;
                      setResponses(newResp);
                    }}
                    className="flex-1 p-2 border border-slate-300 rounded-md text-sm"
                  />
                  <input 
                    placeholder="Unit (e.g. MPa)"
                    value={resp.unit}
                    onChange={e => {
                      const newResp = [...responses];
                      newResp[idx].unit = e.target.value;
                      setResponses(newResp);
                    }}
                    className="w-32 p-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              ))}
            </div>
            <button 
              onClick={() => setResponses([...responses, { name: '', unit: '', type: 'continuous' }])}
              className="mt-3 text-sm text-indigo-600 font-medium hover:underline"
            >
              + Add Response
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreatePlan} disabled={createExp.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
            >
              Generate Protocol
            </button>
          </div>
        </div>
      )}

      {/* Experiment List */}
      <div className="space-y-6">
        {experiments?.map(exp => (
          <div key={exp.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            <div 
              className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
              onClick={() => setExpandedExpId(expandedExpId === exp.id ? null : exp.id)}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${exp.status === 'draft' ? 'bg-amber-400' : 'bg-green-500'}`} />
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{exp.name}</h3>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
                    {exp.design_type.replace('_', ' ')} • {exp.runs?.length || 0} Runs • <span className="font-bold">{exp.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                {exp.status === 'draft' ? (
                  <>
                    <button 
                      onClick={() => handleFinalizePlan(exp.id)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition border border-green-200"
                      title="Finalize protocol"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setResettingId(exp.id)}
                      className="p-1 px-2 text-red-600 hover:bg-red-50 rounded transition border border-red-200 flex items-center space-x-1"
                      title="Clear ALL results for this protocol"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold">CLEAR RESULTS</span>
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => handleNewIteration(exp.id)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition flex items-center space-x-1 border border-indigo-100 px-2"
                    title="Design new iteration based on this"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-[10px] font-bold">NEW ITERATION</span>
                  </button>
                )}
                
                <div className="w-px h-6 bg-slate-200 mx-2" />
                
                <span className="text-sm font-medium text-slate-400">
                  {expandedExpId === exp.id ? 'Collapse' : 'Expand'}
                </span>
              </div>
            </div>

            {expandedExpId === exp.id && (
              <div className="p-6">
                
                {/* Responses Map */}
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="text-xs text-slate-500 font-medium py-1">Tracking metrics:</span>
                  {exp.responses?.map(r => (
                    <span key={r.id} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs rounded-md">
                      {r.name} ({r.unit})
                    </span>
                  ))}
                </div>

                {/* Runs Table */}
                <div className="space-y-4">
                  {exp.runs?.map(run => (
                    <div key={run.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-slate-800 text-sm">Run #{run.run_number}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${run.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {run.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {exp.responses?.map(resp => {
                          const existingRes = run.results?.find(r => r.response_id === resp.id);
                          return (
                            <div key={resp.id} className="flex items-center space-x-2 bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                              <span className="text-xs font-medium text-slate-600 w-24 truncate" title={resp.name}>{resp.name}</span>
                              {existingRes ? (
                                <span className="flex-1 text-sm font-semibold text-slate-900">{existingRes.value} <span className="text-xs text-slate-400 font-normal">{resp.unit}</span></span>
                              ) : (
                                <div className="flex-1 flex space-x-2">
                                  <input 
                                    type="number"
                                    placeholder="Value"
                                    className="w-full text-sm p-1 border border-slate-300 rounded"
                                    value={newResultValue[`${run.id}_${resp.id}`] || ''}
                                    onChange={e => setNewResultValue({...newResultValue, [`${run.id}_${resp.id}`]: e.target.value})}
                                  />
                                  <button 
                                    onClick={() => handleSubmitResult(exp.id, run.id, resp.id as number)}
                                    disabled={submitResult.isPending}
                                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded hover:bg-indigo-100 disabled:opacity-50"
                                  >
                                    {submitResult.isPending ? '...' : 'Save'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => handleAddRun(exp.id)} disabled={createRun.isPending}
                    className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 transition disabled:opacity-50"
                  >
                    {createRun.isPending ? 'Adding Run...' : '+ Append New Run'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {experiments?.length === 0 && !isCreating && (
          <EmptyState 
            icon={TestTube}
            title="No experiments"
            description="Design your first experimental protocol to begin testing."
          />
        )}
      </div>

      <ConfirmDialog 
        isOpen={resettingId !== null}
        title="Clear Experiment Results?"
        message="This will delete all submitted results for this protocol and reset runs to 'scheduled'. Use this only to correct data entry errors in a draft protocol. For new testing phases, use 'New Iteration' instead."
        onConfirm={handleResetResults}
        onCancel={() => setResettingId(null)}
        variant="danger"
        confirmText="Clear & Reset"
        isLoading={clearResults.isPending}
      />

    </div>
  );
}
