export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="w-full flex items-center justify-center py-10 text-slate-600 dark:text-slate-300">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 border-t-primary rounded-full animate-spin" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
