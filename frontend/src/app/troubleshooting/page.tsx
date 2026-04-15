import { Bot, Paperclip, Send } from "lucide-react";

export default function TroubleshootingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-6 w-full">
      <div className="w-full max-w-3xl flex flex-col h-full border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm bg-slate-50 dark:bg-slate-900 overflow-hidden">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">Quick Troubleshooting</h2>
            <p className="text-xs text-slate-500">Ask PCT Ai about anomalies, defects, or failure analysis.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 text-sm max-w-[80%] shadow-sm">
              Hello! Upload an image of a coating defect or describe the unexpected lab result, and I'll help you deduce the root cause based on established formulation science and your team's historical data.
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition-colors">
            <Paperclip className="h-5 w-5" />
          </button>
          <input 
            type="text" 
            placeholder="E.g. Why is the viscosity dropping overnight in batch #402?" 
            className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none"
          />
          <button className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm">
            <Send className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
