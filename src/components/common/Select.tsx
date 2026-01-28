import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

export type SelectProps = ComponentPropsWithoutRef<"select"> & {
  label?: string;
  error?: string;
  children: ReactNode;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        ) : null}
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all bg-white ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-slate-200 focus:border-sky-500"
          } focus:outline-none focus:ring-4 focus:ring-sky-500/10 ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? <span className="text-sm text-red-500">{error}</span> : null}
      </div>
    );
  },
);

Select.displayName = "Select";
