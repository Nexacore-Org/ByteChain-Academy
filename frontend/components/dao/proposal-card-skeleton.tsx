"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProposalCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="space-y-3">
        <div className="h-6 w-2/3 bg-white/10 rounded" />
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 w-full bg-white/10 rounded-full" />
        <div className="h-3 w-1/2 bg-white/10 rounded" />
      </CardContent>
    </Card>
  );
}
