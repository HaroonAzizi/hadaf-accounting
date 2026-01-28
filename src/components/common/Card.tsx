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
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${
        hover
          ? "hover:shadow-xl hover:border-sky-500/30 transition-all duration-300 cursor-pointer hover:-translate-y-1"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
