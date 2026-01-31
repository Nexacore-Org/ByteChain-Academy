"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            id={inputId}
            className={cn(
              "peer h-5 w-5 shrink-0 appearance-none rounded border border-white/20 bg-[#0b1327] cursor-pointer",
              "checked:bg-[#00ff88] checked:border-[#00ff88]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              className,
            )}
            ref={ref}
            {...props}
          />
          <svg
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-[#002E20] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-300 cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
