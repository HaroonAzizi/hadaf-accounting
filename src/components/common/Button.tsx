import type { ComponentType, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "income"
  | "expense"
  | "outline"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-medium rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/20";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    income: "bg-emerald-500 text-white hover:bg-emerald-600",
    expense: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border-2 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 bg-white/40 dark:bg-slate-950/20 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-300",
    ghost:
      "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/70 shadow-none",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5",
    lg: "px-6 py-3.5 text-lg",
  };

  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        isDisabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon ? <Icon size={18} /> : null}
          {children}
        </>
      )}
    </button>
  );
}
