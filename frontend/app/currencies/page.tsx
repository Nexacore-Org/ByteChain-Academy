"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CurrencyCard } from "@/components/currencies/currency-card";
import { CurrencyCardSkeleton } from "@/components/currencies/currency-card-skeleton";
import { CurrencyType, useCurrencies } from "@/hooks/use-currencies";

export default function CurrenciesPage() {
  const [activeType, setActiveType] = useState<CurrencyType>("CRYPTO");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useCurrencies({ type: activeType, search });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-4xl font-bold">Currency Knowledge Hub</h1>
          <p className="text-gray-400 mt-2">Explore historical context and market movements.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2">
            <Button variant={activeType === "CRYPTO" ? "default" : "outline"} onClick={() => setActiveType("CRYPTO")}>
              Crypto
            </Button>
            <Button variant={activeType === "FIAT" ? "default" : "outline"} onClick={() => setActiveType("FIAT")}>
              Fiat
            </Button>
          </div>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or symbol"
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <CurrencyCardSkeleton key={index} />
            ))}
          </div>
        )}
        {isError && <p className="text-red-400">Failed to load currencies.</p>}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.items ?? []).map((currency) => (
              <CurrencyCard key={currency.id} currency={currency} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
