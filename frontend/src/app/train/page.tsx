import { UploadCloud, CheckCircle } from "lucide-react";

export default function TrainAI() {
  return (
    <div className="flex-1 p-12 bg-white dark:bg-slate-950 overflow-y-auto w-full">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Train PCT Ai</h1>
        <p className="text-slate-500 mb-10">Upload successful formulas, failure logs, and technical notes to improve the copilot's intuition specifically for your organization.</p>
        
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 transition-colors cursor-pointer group">
          <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform">
            <UploadCloud className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="font-semibold text-lg">Drag & drop files here</p>
          <p className="text-slate-500 text-sm mt-1">Supports CSV, Excel, PDF, and Text notes.</p>
        </div>

        <div className="mt-8">
            <h3 className="font-semibold mb-3">Add text note directly</h3>
            <textarea 
                className="w-full h-32 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/50" 
                placeholder="E.g. We noticed that adding 2% xylene extends open time without affecting final cure hardness in our polyurethane lines."
            ></textarea>
            <div className="flex justify-end mt-3">
                <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-colors rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4"/> Submit to Training Queue
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
