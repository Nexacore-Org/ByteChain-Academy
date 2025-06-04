"use client";
import { Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Title from "@/components/atoms/Title";

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
      prev.includes(rank) ? prev.filter((id) => id !== rank) : [...prev, rank],
    );
  };

  return (
    <section className="flex flex-col justify-center items-center w-full px-4">
      <Title className="rotate-[15deg]">Currency Hub</Title>

      <div className="w-full mx-auto mt-14 mb-4 overflow-x-auto">
        <Table className="min-w-full border-y-1 text-[#1A2C38]">
          <TableHeader>
            <TableRow className="text-base">
              <TableHead className="w-8 py-2.5"></TableHead>
              <TableHead className="w-8 py-2.5">#</TableHead>
              <TableHead className="w-1/6 py-2.5 font-bold">Name</TableHead>
              <TableHead className="w-1/8 text-right py-2.5 font-bold">
                Price
              </TableHead>
              <TableHead className="hidden sm:table-cell w-1/12 text-right py-2.5 font-bold">
                1h %
              </TableHead>
              <TableHead className="hidden sm:table-cell w-1/12 text-right py-2.5 font-bold">
                24h %
              </TableHead>
              <TableHead className="hidden sm:table-cell w-1/12 text-right py-2.5 font-bold">
                7d %
              </TableHead>
              <TableHead className="hidden md:table-cell w-1/6 text-right py-2.5 font-bold">
                Market Cap
              </TableHead>
              <TableHead className="hidden lg:table-cell w-1/6 text-right py-2.5 font-bold">
                Circulating Supply
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((coin, index) => (
              <TableRow key={index} className="">
                <TableCell className="py-3">
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
                </TableCell>
                <TableCell>{coin.rank}</TableCell>
                <TableCell>
                  {coin.name}{" "}
                  <span className="text-gray-500 text-xs">{coin.symbol}</span>
                </TableCell>
                <TableCell
                  className={`text-right ${
                    coin.price.includes("$80,000") ||
                    coin.price.includes("$0.9")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {coin.price}
                </TableCell>
                <TableCell
                  className={`hidden sm:table-cell text-right ${
                    coin.price.includes("$0.99")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {coin.change1h}
                </TableCell>
                <TableCell className="hidden text-right sm:table-cell text-red-500">
                  {coin.change24h}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right text-red-500">
                  {coin.change7d}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right">
                  {coin.marketCap}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-right">
                  {coin.supply}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="w-full flex justify-end mt-4">
        <Button
          variant="outline"
          className="md:mr-10 px-10 py-5 text-[#7FBFD4] border-[#98E5FE] font-semibold rounded-[20px] hover:bg-[#98E5FE] hover:text-white transition-all duration-300"
        >
          View all
        </Button>
      </div>
    </section>
  );
}
