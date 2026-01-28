import type { HTMLAttributes, ReactNode } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  overflow?: "hidden" | "visible";
};

export function Card({
  children,
  className = "",
  hover = false,
  overflow = "hidden",
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white/90 rounded-2xl border border-slate-200/70 shadow-sm backdrop-blur ${
        overflow === "hidden" ? "overflow-hidden" : "overflow-visible"
      } ${
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
