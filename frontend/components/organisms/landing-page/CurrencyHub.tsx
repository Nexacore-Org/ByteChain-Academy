"use client";

import { Star } from "lucide-react";
import { useState } from "react";

const data = [
  {
    rank: 1,
    name: "Starknet",
    symbol: "STRK",
    price: "$80,000.78",
    change1h: "0.50%",
    change24h: "2.14%",
    change7d: "8.72%",
    marketCap: "$1,600,202,140,262",
    supply: "19.83m STRK",
  },
  {
    rank: 2,
    name: "Naira",
    symbol: "NGN",
    price: "$1500.78",
    change1h: "0.26%",
    change24h: "1.61%",
    change7d: "15.93%",
    marketCap: "$222,994,427,876",
    supply: "120.61m NGN",
  },
  {
    rank: 3,
    name: "Tether",
    symbol: "USDT",
    price: "$0.9996",
    change1h: "0.2%",
    change24h: "0.2%",
    change7d: "0.2%",
    marketCap: "$143,296,510,697",
    supply: "143.34B USDT",
  },
];

export default function CurrencyHub() {
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (rank: number) => {
    setFavorites((prev) =>
      prev.includes(rank) ? prev.filter((id) => id !== rank) : [...prev, rank]
    );
  };

  return (
    <section className="flex flex-col justify-center items-center px-4 w-full">
      <h3 className="bg-[#0066CC] text-white px-7 py-2 rounded-full rotate-[15deg]">
        Currency Hub
      </h3>

      <div className="w-full max-w-5xl mx-auto my-8 overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[0.5fr_0.5fr_2fr_1.5fr_1fr_1fr_1fr_2fr_2fr] gap-4 p-3 text-[#1A2C38] font-bold border-y-2">
            <div></div>
            <div>#</div>
            <div>Name</div>
            <div>Price</div>
            <div>1h %</div>
            <div>24h %</div>
            <div>7d %</div>
            <div>Market Cap</div>
            <div>Circulating Supply</div>
          </div>

          {data.map((coin, index) => (
            <div
              key={index}
              className="grid grid-cols-[0.5fr_0.5fr_2fr_1.5fr_1fr_1fr_1fr_2fr_2fr] gap-4 p-3 text-gray-800 border-b-2 items-center"
            >
              <button
                onClick={() => toggleFavorite(coin.rank)}
                className="cursor-pointer"
              >
                <Star
                  size={20}
                  fill={favorites.includes(coin.rank) ? "yellow" : "none"}
                  stroke={favorites.includes(coin.rank) ? "yellow" : "gray"}
                />
              </button>

              <div>{coin.rank}</div>
              <div>
                {coin.name}{" "}
                <span className="text-gray-500 text-xs">{coin.symbol}</span>
              </div>

              <div
                className={
                  coin.price.includes("$80,000") || coin.price.includes("$0.9")
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {coin.price}
              </div>
              <div
                className={
                  coin.price.includes("$0.99")
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {coin.change1h}
              </div>
              <div className="text-red-500">{coin.change24h}</div>
              <div className="text-red-500">{coin.change7d}</div>
              <div>{coin.marketCap}</div>
              <div>{coin.supply}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="self-center md:self-end mt-4 md:mr-20 px-10 py-3 text-[#7FBFD4] border border-[#98E5FE] font-semibold rounded-[20px] hover:bg-[#98E5FE] hover:text-white transition-all duration-300 cursor-pointer">
        View all
      </button>
    </section>
  );
}
