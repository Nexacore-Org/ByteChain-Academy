"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, ShieldCheck, Award, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCertificates } from "@/hooks/use-certificates";
import { CertificateCard } from "@/components/certificates/certificate-card";

export default function MyCertificatesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: certificates, isLoading: certsLoading, isError, refetch } = useCertificates();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white hover:bg-white/5">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Certificates</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl">
              Showcase your achievements. All certificates are cryptographically signed and verifiable on-chain.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-400 text-sm font-bold uppercase tracking-wider">
             <ShieldCheck className="w-5 h-5" />
             Secured by ByteChain
          </div>
        </div>

        {certsLoading ? (
          <div className="grid gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse border border-white/10" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white/[0.02] rounded-3xl border border-white/5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-1">
               <h3 className="text-xl font-bold">Failed to load certificates</h3>
               <p className="text-gray-400">There was an error connecting to the verification server.</p>
            </div>
            <Button 
              onClick={() => void refetch()}
              className="bg-white/10 hover:bg-white/20 text-white border-white/10"
            >
              Try Again
            </Button>
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-white/[0.02] rounded-3xl border border-white/5">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 opacity-50">
              <Award className="w-10 h-10 text-gray-400" />
            </div>
            <div className="space-y-2">
               <h3 className="text-2xl font-bold">No certificates yet</h3>
               <p className="text-gray-400 max-w-xs mx-auto">
                 Complete courses and pass quizzes to earn your blockchain certifications.
               </p>
            </div>
            <Link href="/courses">
              <Button className="bg-green-500 hover:bg-green-400 text-[#002E20] font-black px-8 h-12 rounded-xl transition-all hover:scale-105">
                Explore Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
