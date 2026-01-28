import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentType,
} from "react";

export type InputProps = ComponentPropsWithoutRef<"input"> & {
  label?: string;
  error?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        ) : null}

        <div className="relative">
          {Icon ? (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Icon size={20} />
            </div>
          ) : null}

          <input
            ref={ref}
            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all ${
              Icon ? "pl-11" : ""
            } ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-slate-200 focus:border-sky-500"
            } focus:outline-none focus:ring-4 focus:ring-sky-500/10 ${className}`}
            {...props}
          />
        </div>

        {error ? <span className="text-sm text-red-500">{error}</span> : null}
      </div>
    );
  },
);

Input.displayName = "Input";
