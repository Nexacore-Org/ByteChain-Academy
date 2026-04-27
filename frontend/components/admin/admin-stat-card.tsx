import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  change?: number; // positive = up, negative = down
  className?: string;
}

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  change,
  className,
}: AdminStatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="flex items-start justify-between pt-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value.toLocaleString()}</p>
          {change !== undefined && (
            <p
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-600" : "text-red-500",
              )}
            >
              {isPositive ? "+" : ""}
              {change}% from last month
            </p>
          )}
        </div>
        <div className="rounded-lg bg-emerald-50 p-2">
          <Icon className="h-5 w-5 text-emerald-600" />
        </div>
      </CardContent>
    </Card>
  );
}
