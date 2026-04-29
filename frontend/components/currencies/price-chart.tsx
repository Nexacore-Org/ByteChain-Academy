"use client";

import { CurrencyHistoryPoint } from "@/hooks/use-currencies";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function PriceChart({ data }: { data: CurrencyHistoryPoint[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            stroke="#888"
          />
          <YAxis stroke="#888" />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
          />
          <Line type="monotone" dataKey="price" stroke="#00ff88" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
