"use client";

import { Button } from "@/components/ui/button";

export type DateRangeKey = "1M" | "3M" | "6M" | "1Y" | "ALL";

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeKey;
  onChange: (next: DateRangeKey) => void;
}) {
  const ranges: DateRangeKey[] = ["1M", "3M", "6M", "1Y", "ALL"];

  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <Button
          key={range}
          variant={range === value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(range)}
        >
          {range}
        </Button>
      ))}
    </div>
  );
}
