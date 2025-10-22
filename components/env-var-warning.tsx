export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-normal border border-gray-200 text-gray-600 dark:border-neutral-700 dark:text-neutral-400">
        Supabase environment variables required
      </span>
      <div className="flex gap-2">
        <button
          disabled
          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        >
          Sign in
        </button>
        <button
          disabled
          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-blue-700"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
