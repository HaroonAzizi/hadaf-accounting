import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="w-full flex items-center justify-center py-12">
      <div className="max-w-md text-center bg-white/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl p-8 shadow-sm backdrop-blur">
        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description ? (
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
            {description}
          </p>
        ) : null}
        {action ? (
          <div className="mt-6 flex justify-center">{action}</div>
        ) : null}
      </div>
    </div>
  );
}
