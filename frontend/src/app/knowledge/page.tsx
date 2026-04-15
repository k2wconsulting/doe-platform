export default function KnowledgeCentre() {
  return (
    <div className="flex-1 p-12 bg-white dark:bg-slate-950 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Knowledge Centre</h1>
      <p className="text-slate-500 mb-8">Search the vector database of uploaded textbooks, TDS/SDSs, and recorded literature.</p>
      
      <div className="max-w-2xl">
        <input 
          type="text" 
          placeholder="Search for cross-linking literature..." 
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4 focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm"
        />
      </div>
      
      <div className="mt-12 grid grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
          <h3 className="font-semibold mb-2">Recent Uploads</h3>
          <ul className="text-sm text-slate-500 space-y-2">
            <li>TDS_Resin_A420.pdf</li>
            <li>Polymer_Science_Vol2.epub</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
