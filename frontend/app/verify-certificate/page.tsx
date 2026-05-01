"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useCertificateVerification } from "@/hooks/use-certificates";
import { 
  ShieldCheck, 
  Search, 
  ArrowRight,
  Loader2,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { VerificationResultView } from "@/components/certificates/verification-result";

function VerifyCertificateContent() {
  const searchParams = useSearchParams();
  const initialHash = searchParams.get("hash") || "";
  const [inputValue, setInputValue] = useState(initialHash);
  const [activeHash, setActiveHash] = useState(initialHash);
  
  const { data: result, isLoading: loading } = useCertificateVerification(activeHash);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    setActiveHash(inputValue.trim());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
           <Sparkles className="w-3 h-3" />
           Trustless Verification
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
          Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Authenticity</span>
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
          Verify the integrity of certificates issued by ByteChain Academy. Enter a certificate hash to check its on-chain status.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <Card className="relative border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden rounded-2xl">
          <CardContent className="p-2">
            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Enter certificate hash (e.g. 0x...)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="pl-12 h-14 bg-transparent border-none text-white text-lg focus-visible:ring-0 placeholder:text-gray-600"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !inputValue.trim()}
                className="h-14 sm:h-auto sm:px-10 bg-green-500 hover:bg-green-400 text-[#002E20] font-black text-lg transition-all rounded-xl"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  "Verify Now"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
           <div className="relative">
              <div className="w-16 h-16 rounded-full border-t-2 border-green-500 animate-spin" />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-500/50" />
           </div>
           <p className="text-gray-500 font-medium animate-pulse uppercase tracking-[0.3em] text-xs">Querying Blockchain...</p>
        </div>
      ) : activeHash && result ? (
        <VerificationResultView result={result} hash={activeHash} />
      ) : null}

      {!activeHash && (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            {[
              { title: "Immutable", desc: "Forged on-chain, impossible to alter or counterfeit.", icon: ShieldCheck },
              { title: "Public", desc: "Open to anyone with the hash. No account required.", icon: Search },
              { title: "Instant", desc: "Zero-latency verification against our decentralized registry.", icon: Sparkles }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                 <feature.icon className="w-8 h-8 text-green-500/40" />
                 <h4 className="font-bold text-white uppercase text-xs tracking-widest">{feature.title}</h4>
                 <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
         </div>
      )}

      <div className="text-center pt-8">
        <Link href="/dashboard" className="group text-gray-500 hover:text-white text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-all">
          Return to Dashboard
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-green-500/30">
      <Header />
      <main className="container mx-auto px-6 py-20">
        <Suspense fallback={
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        }>
          <VerifyCertificateContent />
        </Suspense>
      </main>
    </div>
  );
}
