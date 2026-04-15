import Link from 'next/link';
import { FolderKanban, Wrench, FlaskConical, BookOpen, UserCircle, BrainCircuit, TestTube2 } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-screen overflow-hidden shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
          <TestTube2 className="h-6 w-6" />
          <span>PCT Ai</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">Formulation Copilot</p>
        {process.env.NEXT_PUBLIC_APP_ENV === 'uat' && (
          <div className="mt-4 px-2 py-1 bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold rounded uppercase tracking-widest text-center shadow-sm">
            UAT Review Mode
          </div>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto w-full">
        <Link href="/projects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <FolderKanban className="h-5 w-5" />
          Projects
        </Link>
        <Link href="/troubleshooting" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <Wrench className="h-5 w-5" />
          Quick Troubleshooting
        </Link>
        <Link href="/formulations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <FlaskConical className="h-5 w-5" />
          Formulation Assistance
        </Link>
        <Link href="/knowledge" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <BookOpen className="h-5 w-5" />
          Knowledge Centre
        </Link>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
          <UserCircle className="h-5 w-5" />
          My Profile
        </Link>
        <Link href="/train" className="flex items-center gap-3 px-3 py-2 rounded-lg text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors">
          <BrainCircuit className="h-5 w-5" />
          Train PCT Ai
        </Link>
      </div>
    </aside>
  );
}
