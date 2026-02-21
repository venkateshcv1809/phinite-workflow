export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Dashboard
      </h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        Welcome to your Phinite Workflow dashboard!
      </p>
      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Workflows
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your workflow management interface will appear here.
        </p>
      </div>
    </div>
  );
}
