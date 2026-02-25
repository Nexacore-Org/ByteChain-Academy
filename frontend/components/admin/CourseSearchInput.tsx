"use client";

import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CourseSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function CourseSearchInput({
  value,
  onChange,
  onClear,
  isLoading = false,
  placeholder = "Search courses...",
  className,
}: CourseSearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-20"
        aria-label="Search courses"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && (
          <Loader2
            className="w-5 h-5 text-[#00ff88] animate-spin"
            aria-hidden
          />
        )}
        {value && !isLoading && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
