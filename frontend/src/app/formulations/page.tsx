"use client";

import { useState } from 'react';
import { Search, Save, Info, Plus } from 'lucide-react';

export default function FormulationAssistance() {
  const [tab, setTab] = useState<'new' | 'existing'>('new');

  return (
    <div className="flex-1 flex overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto p-8 lg:px-12 bg-white dark:bg-slate-950">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Formulation Assistance</h1>
          
          <div className="flex gap-4 mt-6 border-b border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setTab('new')}
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${tab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Generate New Formula
            </button>
            <button 
              onClick={() => setTab('existing')}
              className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${tab === 'existing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              Work on Existing Formula
            </button>
          </div>
        </header>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 font-medium rounded-lg">Bill of Materials</button>
              <button className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Procedure Blocks</button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm font-medium">
              <Save className="h-4 w-4" /> Save Formulation
            </button>
          </div>

          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100/50 dark:bg-slate-900 text-slate-600 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-medium">Raw Material</th>
                <th className="p-4 font-medium">Role</th>
                <th className="p-4 font-medium">Function / Purpose</th>
                <th className="p-4 font-medium">Dosage</th>
                <th className="p-4 font-medium">Cost/Unit</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr className="hover:bg-white dark:hover:bg-slate-950 transition-colors">
                <td className="p-4 font-medium text-indigo-600">Water</td>
                <td className="p-4 text-slate-500">Solvent</td>
                <td className="p-4 text-slate-500">Continuous Phase</td>
                <td className="p-4 font-mono">Q.S. 100%</td>
                <td className="p-4 text-slate-500">$0.00</td>
                <td className="p-4 text-right"><button className="text-indigo-600 text-xs font-semibold">Substitute</button></td>
              </tr>
              <tr className="hover:bg-white dark:hover:bg-slate-950 transition-colors">
                <td className="p-4 font-medium text-indigo-600">TiO2 (Rutile)</td>
                <td className="p-4 text-slate-500">Pigment</td>
                <td className="p-4 text-slate-500">Opacity, Whiteness</td>
                <td className="p-4 font-mono">15.0 wt%</td>
                <td className="p-4 text-slate-500">$3.50/kg</td>
                <td className="p-4 text-right"><button className="text-indigo-600 text-xs font-semibold">Substitute</button></td>
              </tr>
            </tbody>
          </table>
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-center">
             <button className="flex items-center gap-1 text-sm font-medium text-indigo-600"><Plus className="h-4 w-4"/> Add Item</button>
          </div>
        </div>
      </div>

      {/* Right Side Info Panel */}
      <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-600"/>
              <h3 className="font-semibold">Material Properties</h3>
          </div>
          <div className="p-6 text-sm text-slate-500">
              Click on a raw material in the table to view its properties parsed from library TDS/SDS documents.
          </div>
      </aside>
    </div>
  );
}
