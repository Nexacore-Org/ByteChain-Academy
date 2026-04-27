"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type CurrencyType = "CRYPTO" | "FIAT";

export interface CurrencyItem {
  id: string;
  name: string;
  symbol: string;
  type: CurrencyType;
  description: string;
  logoUrl?: string;
  launchYear?: number;
}

interface CurrencyListResponse {
  items: CurrencyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CurrencyHistoryPoint {
  date: string;
  price: number;
}

export function useCurrencies(params: { type?: CurrencyType; search?: string }) {
  const query = new URLSearchParams();
  if (params.type) query.set("type", params.type);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();

  return useQuery({
    queryKey: ["currencies", params.type ?? "ALL", params.search ?? ""],
    queryFn: () => api.get<CurrencyListResponse>(`/currencies${qs ? `?${qs}` : ""}`),
  });
}

export function useCurrency(id: string) {
  return useQuery({
    queryKey: ["currency", id],
    queryFn: () => api.get<CurrencyItem>(`/currencies/${id}`),
    enabled: Boolean(id),
  });
}

export function useCurrencyHistory(id: string, from?: string, to?: string) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const qs = query.toString();

  return useQuery({
    queryKey: ["currency-history", id, from ?? "", to ?? ""],
    queryFn: () => api.get<CurrencyHistoryPoint[]>(`/currencies/${id}/history${qs ? `?${qs}` : ""}`),
    enabled: Boolean(id),
  });
}
