"use client";

import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Shield, GraduationCap, Ban } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { CertificateSearchInput } from "@/components/admin/certificate-search-input";
import { RevokeCertificateDialog } from "@/components/admin/revoke-certificate-dialog";
import { toast } from "sonner";

interface AdminCertificate {
  id: string;
  certificateHash: string;
  recipientName: string;
  recipientEmail: string;
  courseOrProgram: string;
  issuedAt: string;
  expiresAt: string | null;
  isValid: boolean;
}

interface CertificatesResponse {
  totalIssued: number;
  revoked: number;
  data: AdminCertificate[];
}

function StatCardSkeleton() {
  return (
    <div className="h-24 animate-pulse rounded-xl bg-white/10" aria-hidden />
  );
}

export default function AdminCertificatesPage() {
  const { isAuthenticated } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [data, setData] = useState<CertificatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    cert: AdminCertificate | null;
  }>({ open: false, cert: null });

  const isAdmin = user?.role === "Admin";

  const fetchCertificates = useCallback(async (search?: string) => {
    try {
      const params = search?.trim() ? { search: search.trim() } : undefined;
      const res = await api.get<CertificatesResponse>("/certificates/all", params);
      setData(res);
    } catch {
      setData({ totalIssued: 0, revoked: 0, data: [] });
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    void fetchCertificates();
  }, [isAuthenticated, isAdmin, router, fetchCertificates]);

  const handleSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setSearchLoading(true);
        void fetchCertificates();
        return;
      }
      setSearchLoading(true);
      void fetchCertificates(value);
    },
    [fetchCertificates]
  );

  const handleRevokeClick = (cert: AdminCertificate) => {
    if (!cert.isValid) return;
    setRevokeDialog({ open: true, cert });
  };

  const handleRevokeConfirm = async () => {
    const cert = revokeDialog.cert;
    if (!cert) return;
    try {
      await api.patch(`/certificates/${cert.id}/revoke`);
      toast.success("Certificate revoked");
      setRevokeDialog({ open: false, cert: null });
      setData((prev) => {
        if (!prev) return prev;
        const updated = prev.data.map((c) =>
          c.id === cert.id ? { ...c, isValid: false } : c
        );
        const revoked = updated.filter((c) => !c.isValid).length;
        return { ...prev, data: updated, revoked };
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to revoke certificate"
      );
    }
  };

  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      <main className="container mx-auto px-6 py-12 max-w-7xl">
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
              <Shield className="w-5 h-5 text-[#00ff88]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Certificates Admin</h1>
          </div>
          <p className="text-gray-400">Manage and revoke certificates</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#00ff88]/20 border border-[#00ff88]/30">
                    <GraduationCap className="w-6 h-6 text-[#00ff88]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Issued</p>
                    <p className="text-3xl font-bold text-white">
                      {data?.totalIssued ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a]">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30">
                    <Ban className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Revoked</p>
                    <p className="text-3xl font-bold text-white">
                      {data?.revoked ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <CertificateSearchInput
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
            isLoading={searchLoading}
          />
        </div>

        {/* Table */}
        <Card className="border-[#00ff88]/20 bg-gradient-to-br from-[#080e22] to-[#0a0a0a] overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Recipient
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Course
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Issued
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Expires
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : !data?.data?.length ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        {searchValue.trim() ? (
                          <>No certificates match &quot;{searchValue}&quot;</>
                        ) : (
                          "No certificates found"
                        )}
                      </td>
                    </tr>
                  ) : (
                    data.data.map((cert) => (
                      <tr
                        key={cert.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-white">
                              {cert.recipientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {cert.recipientEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          {cert.courseOrProgram}
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {cert.expiresAt
                            ? new Date(cert.expiresAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              cert.isValid
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {cert.isValid ? "Valid" : "Revoked"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {cert.isValid ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeClick(cert)}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                              Revoke
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-500 italic">
                              Revoked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      <RevokeCertificateDialog
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog((p) => ({ ...p, open }))}
        recipientName={revokeDialog.cert?.recipientName ?? ""}
        courseName={revokeDialog.cert?.courseOrProgram ?? ""}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  );
}
