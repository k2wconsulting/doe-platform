export default function Profile() {
  return (
    <div className="flex-1 p-12 bg-white dark:bg-slate-950 overflow-y-auto w-full">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Profile</h1>
      
      <div className="max-w-xl space-y-6">
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
          <h2 className="font-semibold text-lg mb-4">User Details</h2>
          <div className="space-y-4 text-sm">
             <div>
                <span className="text-slate-500 block mb-1">Company / Organization</span>
                <span className="font-medium">Apex Coatings Inc.</span>
             </div>
             <div>
                <span className="text-slate-500 block mb-1">Role</span>
                <span className="font-medium">Formulation Scientist</span>
             </div>
          </div>
        </div>

        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900">
          <h2 className="font-semibold text-lg mb-4">Library Management</h2>
          <p className="text-sm text-slate-500">Manage your private organizational datasets and vectors.</p>
        </div>
      </div>
    </div>
  );
}
