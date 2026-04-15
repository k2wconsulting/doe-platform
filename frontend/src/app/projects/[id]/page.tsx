'use client';

import { useIntake } from '@/hooks/useProjects';
import { useDomainInsights } from '@/hooks/useDomainServices';
import { useState } from 'react';
import IntakeEditModal from '@/components/projects/IntakeEditModal';
import { Edit3 } from 'lucide-react';

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const { data: intake, isLoading } = useIntake(id);
  const { data: insights, isLoading: isInsightsLoading } = useDomainInsights(id);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  if (isLoading) return (
    <div className="space-y-6">
      <div className="h-20 bg-indigo-50/50 rounded-xl animate-pulse" />
      <div className="h-48 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
      <div className="h-48 bg-slate-50 rounded-xl border border-slate-200 animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Edit3 className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-900">Problem Definition</h3>
            <p className="text-xs text-indigo-700">Refine your objectives and constraints as the project evolves.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsIntakeModalOpen(true)}
          className="px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition shadow-sm"
        >
          Edit Goals & Constraints
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">Project Objectives</h2>
        {intake?.objectives?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intake.objectives.map((obj: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-sm text-slate-500 font-medium mb-1">Parameter</div>
                <div className="font-semibold text-slate-900">{obj.parameter}</div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                  <div>Target: <span className="font-medium">{obj.target_value}</span></div>
                  <div>Dir: <span className="font-medium capitalize">{obj.direction}</span></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">No objectives defined.</div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">Constraints & Bounds</h2>
        {intake?.constraints?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intake.constraints.map((con: any, idx: number) => (
              <div key={idx} className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="text-sm text-red-500 font-medium mb-1 capitalize">{con.constraint_type} Constraint</div>
                <div className="font-semibold text-red-900">
                  {con.operator} {con.limit_value}
                </div>
                {con.description && <div className="mt-2 text-sm text-red-700">{con.description}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-500 text-sm">No constraints defined.</div>
        )}
      </div>

      <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-indigo-900 flex items-center">
          <span className="mr-2">Domain Expert Services</span>
        </h2>
        
        {isInsightsLoading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            </div>
        ) : insights ? (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50/50 p-4 rounded border border-indigo-100">
                     <h4 className="font-semibold text-indigo-800 text-sm mb-1">Problem Classification</h4>
                     <p className="font-medium capitalize text-slate-800">{insights.classify?.problem_type}</p>
                     <p className="text-xs text-slate-600 mt-1">{insights.classify?.rationale}</p>
                  </div>
                  <div className="bg-indigo-50/50 p-4 rounded border border-indigo-100">
                     <h4 className="font-semibold text-indigo-800 text-sm mb-1">Design Recommendation</h4>
                     <p className="font-medium capitalize text-slate-800">{insights.recommend?.recommended_design}</p>
                     <p className="text-xs text-slate-600 mt-1">{insights.recommend?.rationale}</p>
                     {insights.recommend?.cautions?.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-xs text-amber-700">
                           {insights.recommend.cautions.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                        </ul>
                     )}
                  </div>
               </div>

               <div>
                 <h4 className="font-semibold text-slate-800 mb-2">Constraint Auditor</h4>
                 {insights.audit?.is_valid ? (
                    <div className="text-sm text-green-700 flex items-center">✓ All {insights.audit?.audited_count} constraints pass structural integrity.</div>
                 ) : (
                    <div className="text-sm text-amber-700 space-y-1">
                       {insights.audit?.warnings?.map((w: string, idx: number) => <div key={idx}>• {w}</div>)}
                    </div>
                 )}
               </div>

               <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-semibold text-slate-800 mb-2">Generated Next Steps</h4>
                  <div className="space-y-2">
                     {insights.nextSteps?.steps?.map((step: string, idx: number) => (
                        <div key={idx} className="text-sm flex p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm">
                           <span className="font-bold text-slate-400 mr-3">{idx + 1}.</span>
                           <span className="text-slate-700">{step}</span>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
        ) : (
            <div className="text-sm text-slate-500">Failed to load expert insights.</div>
        )}
      </div>

      <IntakeEditModal 
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        projectId={id}
      />
    </div>
  );
}
