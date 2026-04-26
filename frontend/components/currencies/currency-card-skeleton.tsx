"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CurrencyCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="space-y-3">
        <div className="h-6 w-1/2 bg-white/10 rounded" />
        <div className="h-4 w-1/4 bg-white/10 rounded" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-2/3 bg-white/10 rounded" />
      </CardContent>
    </Card>
  );
}
