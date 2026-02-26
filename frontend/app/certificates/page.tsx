"use client";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, GraduationCap } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Certificate {
  id: string;
  certificateHash: string;
  recipientName: string;
  recipientEmail: string;
  courseOrProgram: string;
  issuedAt: string;
  expiresAt: string | null;
  isValid: boolean;
}

export default function MyCertificatesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    const load = async () => {
      try {
        const data = await api.get<Certificate[]>("/certificates");
        setCertificates(Array.isArray(data) ? data : []);
      } catch {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-4xl">
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
              <GraduationCap className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">My Certificates</h1>
          </div>
          <p className="text-gray-400">
            View and manage your earned certificates
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-xl bg-white/5"
                aria-hidden
              />
            ))}
          </div>
        ) : certificates.length === 0 ? (
          <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 mb-4">
                <Award className="w-12 h-12 text-[#00ff88]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No certificates yet</h3>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Complete courses to earn certificates. Your certificates will
                appear here once you finish a course.
              </p>
              <Link href="/courses">
                <Button className="gap-2 bg-gradient-to-r from-[#00ff88] to-[#00d88b] text-[#002E20]">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a] hover:border-[#00ff88]/40 transition-colors"
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cert.courseOrProgram}</CardTitle>
                    <p className="text-sm text-gray-400 mt-1">
                      Issued {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cert.isValid
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {cert.isValid ? "Valid" : "Revoked"}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">
                    Hash: <code className="text-gray-300">{cert.certificateHash.slice(0, 16)}...</code>
                  </p>
                  <Link href="/verify-certificate" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      Verify Certificate
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
