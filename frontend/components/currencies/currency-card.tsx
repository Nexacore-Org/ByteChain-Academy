"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyItem } from "@/hooks/use-currencies";

export function CurrencyCard({ currency }: { currency: CurrencyItem }) {
  const badgeClass =
    currency.type === "CRYPTO"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-blue-500/20 text-blue-300 border-blue-500/30";

  return (
    <Link href={`/currencies/${currency.id}`}>
      <Card className="h-full hover:border-[#00ff88]/40 transition-colors cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-xl">{currency.name}</CardTitle>
            <span className={`text-xs px-2 py-1 rounded-full border ${badgeClass}`}>{currency.type}</span>
          </div>
          <p className="text-sm text-gray-400">{currency.symbol}</p>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 text-sm line-clamp-3">{currency.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
