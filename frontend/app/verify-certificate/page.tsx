"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, FileCheck, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface VerificationResult {
  isValid: boolean;
  message: string;
  certificate?: {
    recipientName: string;
    recipientEmail: string;
    courseOrProgram: string;
    issuedAt: string;
    expiresAt: string | null;
    isValid: boolean;
  };
}

export default function VerifyCertificatePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await api.post<VerificationResult>("/certificates/verify", {
        certificateHash: hash.trim(),
      });
      setResult(data);
    } catch (err) {
      setResult({
        isValid: false,
        message: err instanceof Error ? err.message : "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2 text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
              <FileCheck className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Verify Certificate</h1>
          </div>
          <p className="text-gray-400">
            Enter the certificate hash to verify its authenticity
          </p>
        </div>

        <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a] mb-8">
          <CardHeader>
            <CardTitle>Certificate Hash</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <Input
                placeholder="Paste certificate hash (e.g. abc123...)"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="font-mono text-sm"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={!hash.trim() || loading}
                className="gap-2 bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#002E20]/30 border-t-[#002E20] rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    Verify
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card
            className={`border-2 ${
              result.isValid ? "border-green-500/50" : "border-red-500/50"
            } bg-gradient-to-br from-[#080e22] to-[#0a0a0a]`}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {result.isValid ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
                )}
                <div>
                  <h3
                    className={`font-semibold text-lg ${
                      result.isValid ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.isValid ? "Certificate Valid" : "Certificate Invalid"}
                  </h3>
                  <p className="text-gray-400 mt-2">{result.message}</p>
                  {result.certificate && (
                    <div className="mt-4 p-4 rounded-lg bg-white/5 space-y-2">
                      <p>
                        <span className="text-gray-500">Recipient:</span>{" "}
                        {result.certificate.recipientName}
                      </p>
                      <p>
                        <span className="text-gray-500">Course:</span>{" "}
                        {result.certificate.courseOrProgram}
                      </p>
                      <p>
                        <span className="text-gray-500">Issued:</span>{" "}
                        {new Date(result.certificate.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
