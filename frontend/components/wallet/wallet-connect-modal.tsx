"use client";

import { useState } from "react";
import { X, Key, Smartphone, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface WalletConnectModalProps {
  onClose: () => void;
  onConnected: () => void;
}

type Tab = "secret" | "lobstr";

export function WalletConnectModal({ onClose, onConnected }: WalletConnectModalProps) {
  const [tab, setTab] = useState<Tab>("secret");
  const [secretKey, setSecretKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSecretKeyConnect() {
    setError("");
    if (!secretKey.startsWith("S") || secretKey.length < 56) {
      setError("Invalid secret key. Stellar secret keys start with 'S'.");
      return;
    }
    setLoading(true);
    try {
      // Dynamic import to avoid SSR issues with stellar-sdk
      const { Keypair } = await import("@stellar/stellar-sdk");
      const keypair = Keypair.fromSecret(secretKey);

      // 1. Get challenge
      const { challenge } = await api.post<{ challenge: string }>("/users/me/wallet/challenge", {});

      // 2. Sign challenge
      const signature = keypair.sign(Buffer.from(challenge)).toString("base64");
      const publicKey = keypair.publicKey();

      // 3. Verify
      await api.post("/users/me/wallet/verify", { publicKey, signature, challenge });

      onConnected();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    } finally {
      setLoading(false);
      setSecretKey("");
    }
  }

  const lobstrDeepLink = `lobstr://sign?callback=${encodeURIComponent(window.location.origin + "/api/wallet/lobstr-callback")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0f1629] border border-[#00ff88]/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Connect Stellar Wallet</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setTab("secret")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === "secret" ? "text-[#00ff88] border-b-2 border-[#00ff88]" : "text-gray-400 hover:text-white"}`}
          >
            <Key className="w-4 h-4" />
            Secret Key
          </button>
          <button
            onClick={() => setTab("lobstr")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${tab === "lobstr" ? "text-[#00ff88] border-b-2 border-[#00ff88]" : "text-gray-400 hover:text-white"}`}
          >
            <Smartphone className="w-4 h-4" />
            LOBSTR
          </button>
        </div>

        <div className="p-6">
          {tab === "secret" ? (
            <div className="space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300">
                  Never share your secret key with anyone. It is used locally to sign a challenge and is never sent to our servers.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Stellar Secret Key</label>
                <Input
                  type="password"
                  placeholder="S..."
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="bg-[#0b1327] border-white/10 focus:border-[#00ff88] font-mono"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                onClick={handleSecretKeyConnect}
                disabled={loading || !secretKey}
                className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20] font-semibold"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Sign & Connect
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-[#1a1a2e] border border-white/10">
                <Smartphone className="w-12 h-12 text-[#00ff88] mx-auto mb-3" />
                <p className="text-white font-medium mb-2">Connect with LOBSTR</p>
                <p className="text-sm text-gray-400 mb-4">
                  LOBSTR is the most popular Stellar wallet. Open the deep link on your mobile device to connect.
                </p>
                <a
                  href={lobstrDeepLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/20 transition-colors font-medium"
                >
                  <Smartphone className="w-4 h-4" />
                  Open LOBSTR
                </a>
              </div>
              <p className="text-xs text-gray-500">
                Don&apos;t have LOBSTR?{" "}
                <a href="https://lobstr.co" target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:underline">
                  Download it here
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
