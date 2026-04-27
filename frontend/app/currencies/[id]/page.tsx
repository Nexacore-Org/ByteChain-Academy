"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeKey, DateRangeSelector } from "@/components/currencies/date-range-selector";
import { PriceChart } from "@/components/currencies/price-chart";
import { useCurrency, useCurrencyHistory } from "@/hooks/use-currencies";
import { CurrencyCardSkeleton } from "@/components/currencies/currency-card-skeleton";

function getFromDate(range: DateRangeKey): string | undefined {
  if (range === "ALL") return undefined;
  const date = new Date();
  if (range === "1M") date.setMonth(date.getMonth() - 1);
  if (range === "3M") date.setMonth(date.getMonth() - 3);
  if (range === "6M") date.setMonth(date.getMonth() - 6);
  if (range === "1Y") date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

export default function CurrencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [range, setRange] = useState<DateRangeKey>("ALL");
  const from = useMemo(() => getFromDate(range), [range]);
  const to = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const currencyQuery = useCurrency(id);
  const historyQuery = useCurrencyHistory(id, from, range === "ALL" ? undefined : to);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 space-y-6">
        <Link href="/currencies">
          <Button variant="ghost">Back to currencies</Button>
        </Link>

        {currencyQuery.isLoading && (
          <div className="max-w-3xl">
            <CurrencyCardSkeleton />
          </div>
        )}
        {currencyQuery.isError && <p className="text-red-400">Failed to load currency details.</p>}

        {currencyQuery.data && (
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {currencyQuery.data.name} ({currencyQuery.data.symbol})
              </CardTitle>
              <p className="text-sm text-gray-400">
                {currencyQuery.data.type} • Launch Year: {currencyQuery.data.launchYear ?? "Unknown"}
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-gray-200">{currencyQuery.data.description}</p>
              <DateRangeSelector value={range} onChange={setRange} />
              {historyQuery.isLoading && (
                <div className="h-80 w-full rounded-xl bg-white/10 animate-pulse" />
              )}
              {historyQuery.isError && <p className="text-red-400">Failed to load history.</p>}
              {historyQuery.data && <PriceChart data={historyQuery.data} />}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
