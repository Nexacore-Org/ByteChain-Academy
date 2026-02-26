"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

interface CertificateSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

export function CertificateSearchInput({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Search by name, email, or course...",
}: CertificateSearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [localValue, onSearch]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-10 pr-10"
        aria-label="Search certificates"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00ff88] animate-spin" />
      )}
    </div>
  );
}
