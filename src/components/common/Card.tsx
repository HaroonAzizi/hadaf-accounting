import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
};

export function Card({
  children,
  className = "",
  hover = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white/90 dark:bg-slate-950/60 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-sm overflow-hidden backdrop-blur ${
        hover
          ? "hover:shadow-xl hover:border-sky-500/30 dark:hover:border-sky-500/40 transition-all duration-300 cursor-pointer hover:-translate-y-1"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
