import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-small font-semibold text-[#17313C]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BA9AE] pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-[14px]",
              "border border-[#DCE7E9] bg-white",
              "px-4 py-2.5 text-[15px] text-[#10232D]",
              "placeholder:text-[#9BA9AE]",
              "transition-all duration-200 ease-out",
              "focus-visible:outline-none",
              "focus-visible:border-[#27A7B5]",
              "focus-visible:shadow-[0_0_0_3px_rgba(39,167,181,0.10)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              leftIcon && "pl-11",
              error && "border-[#D95757] focus-visible:border-[#D95757] focus-visible:shadow-[0_0_0_3px_rgba(217,87,87,0.10)]",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-meta text-[#D95757] mt-1">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
