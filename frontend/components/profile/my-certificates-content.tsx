"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
  CertificateCard,
  type Certificate,
} from "@/components/MyCertificatesPage/Certificatecard";
import { CertificateCardSkeleton } from "@/components/MyCertificatesPage/Certificatecardskeleton";
import { CertificatesEmptyState } from "@/components/MyCertificatesPage/Certificatesemptystate";

type FetchState = "loading" | "success" | "error";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("auth_token") ?? "";
}

export function MyCertificatesContent() {
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") ?? "" : "";

  const fetchCertificates = async () => {
    setFetchState("loading");
    try {
      // Try the primary endpoint
      const data = await api.get<any[]>('/certificates/my');

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      const mapped: Certificate[] = data.map((item) => ({
        id: item.id || Math.random().toString(),
        courseName: item.courseOrProgram || item.courseTitle || "Unknown Course",
        issuedAt: item.issuedAt || new Date().toISOString(),
        verificationCode: item.certificateHash || item.hash || "",
        status: 'active',
      }));

      mapped.sort(
        (a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      );
      setCertificates(mapped);
      setFetchState("success");
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
      setFetchState("error");
      setCertificates([]);
    }
  };

  useEffect(() => {
    void fetchCertificates();
  }, []);

  if (fetchState === "loading") {
    return (
      <div className="flex flex-col gap-4">
        <CertificateCardSkeleton />
        <CertificateCardSkeleton />
      </div>
    );
  }

  if (fetchState === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-yellow-400" />
        <p className="text-white font-semibold">Could not load your certificates.</p>
        <button
          onClick={() => void fetchCertificates()}
          className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors duration-150"
        >
          Try again
        </button>
      </div>
    );
  }

  if (certificates.length === 0) {
    return <CertificatesEmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      {certificates.map((cert) => (
        <CertificateCard key={cert.id} certificate={cert} token={token} />
      ))}
    </div>
  );
}
