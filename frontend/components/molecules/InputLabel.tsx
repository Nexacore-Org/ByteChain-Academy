"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InputWithLabelProps = {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
  className?: string;
};

export const InputWithLabel = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  className,
}: InputWithLabelProps) => {
  const inputId = `${name}-input`;
  const errorId = `${name}-error`;
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={name} className="font-semibold text-lg">{label}</Label>
      <Input
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={type}
        aria-invalid={error && touched ? "true" : "false"}
        aria-describedby={error && touched ? errorId : undefined}
        className={`py-6 mt-2 outline-none ${
          error && touched ? "border-red-500 " : "border-[#00D4FF]"
        }`}
      />
      {error && touched && (
        <p
          id={errorId}
          className="text-red-500 text-sm"
          aria-live="assertive"
        >
          {error}
        </p>
      )}
    </div>
  );
};
