"use client";

import { useState } from "react";
import { Copy, ExternalLink, Unlink, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { WalletConnectModal } from "./wallet-connect-modal";

interface WalletInfo {
  publicKey: string;
}

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletConnectCard() {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const qc = useQueryClient();

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => api.get<WalletInfo | null>("/users/me/wallet").catch(() => null),
  });

  const disconnect = useMutation({
    mutationFn: () => api.delete("/users/me/wallet"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wallet"] }),
  });

  function copyAddress() {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#080e22] via-[#0a0a0a] to-[#080e22] border-[#00ff88]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/5 via-transparent to-[#00ff88]/5" />
        <CardHeader className="relative">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00ff88]" />
            Stellar Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {isLoading ? (
            <div className="h-10 w-48 animate-pulse rounded-lg bg-white/10" />
          ) : wallet?.publicKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0b1327] border border-white/10">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Connected wallet</p>
                  <p className="font-mono text-sm text-[#00ff88] truncate">{truncateAddress(wallet.publicKey)}</p>
                </div>
                <button
                  onClick={copyAddress}
                  className="p-2 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <a
                  href={`https://stellar.expert/explorer/public/account/${wallet.publicKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                  title="View on Stellar Explorer"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
              {copied && <p className="text-xs text-[#00ff88]">Address copied!</p>}
              <Button
                variant="outline"
                onClick={() => disconnect.mutate()}
                disabled={disconnect.isPending}
                className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Unlink className="w-4 h-4" />
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Connect your Stellar wallet to access Web3 features and earn on-chain rewards.
              </p>
              <Button
                onClick={() => setShowModal(true)}
                className="gap-2 bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] font-semibold"
              >
                <Wallet className="w-4 h-4" />
                Connect Stellar Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <WalletConnectModal
          onClose={() => setShowModal(false)}
          onConnected={() => qc.invalidateQueries({ queryKey: ["wallet"] })}
        />
      )}
    </>
  );
}
