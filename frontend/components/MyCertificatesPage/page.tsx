"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, ArrowLeft, AlertTriangle } from "lucide-react";
import { CertificateCard, type Certificate } from "@/components/CertificateCard";
import { CertificateCardSkeleton } from "@/components/CertificateCardSkeleton";
import { CertificatesEmptyState } from "@/components/CertificatesEmptyState";

type FetchState = "loading" | "success" | "error";

function getAuthToken(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("auth_token") ?? "";
}

export default function MyCertificatesPage() {
    const router = useRouter();
    const [fetchState, setFetchState] = useState<FetchState>("loading");
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const token = getAuthToken();

    const fetchCertificates = async () => {
        setFetchState("loading");
        try {
        const res = await fetch("/api/users/me/certificates", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Fetch failed");

        const data: Certificate[] = await res.json();

        // Sort by issuedAt DESC (most recent first)
        data.sort(
            (a, b) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        );

        setCertificates(data);
        setFetchState("success");
        } catch {
        setFetchState("error");
        }
    };

    useEffect(() => {
        fetchCertificates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleProfileBack = () => {
        if (typeof window !== "undefined" && window.history.length > 1) {
        router.back();
        } else {
        router.push("/profile");
        }
    };

    return (
        <div className="min-h-screen bg-[#0d0d1a] flex flex-col">
        {/* ── Minimal nav shell ── */}
        <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            {/* Logo */}
            <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold text-xl tracking-tight">
                Bytechain
            </span>
            <span className="text-white font-bold text-xl tracking-tight">
                Academy
            </span>
            </div>

            {/* ← Profile link */}
            <button
            onClick={handleProfileBack}
            className="group flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-150"
            aria-label="Back to profile"
            >
            <ArrowLeft
                className="w-4 h-4 transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5"
                strokeWidth={2}
            />
            <span className="group-hover:underline underline-offset-2">
                Profile
            </span>
            </button>
        </nav>

        {/* ── Page content ── */}
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/15 shrink-0">
                <GraduationCap className="w-6 h-6 text-green-400" />
            </div>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                My Certificates
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                Your earned certificates from ByteChain Academy
                </p>
            </div>
            </div>

            {/* ── Content area ── */}
            {fetchState === "loading" && (
            <div className="flex flex-col gap-4">
                <CertificateCardSkeleton />
                <CertificateCardSkeleton />
                <CertificateCardSkeleton />
            </div>
            )}

            {fetchState === "error" && (
            <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20 text-center">
                <AlertTriangle className="w-10 h-10 text-yellow-400" />
                <p className="text-white font-semibold">
                Could not load your certificates.
                </p>
                <button
                onClick={fetchCertificates}
                className="px-5 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors duration-150"
                >
                Try again
                </button>
            </div>
            )}

            {fetchState === "success" && certificates.length === 0 && (
            <CertificatesEmptyState />
            )}

            {fetchState === "success" && certificates.length > 0 && (
            <div className="flex flex-col gap-4">
                {certificates.map((cert) => (
                <CertificateCard key={cert.id} certificate={cert} token={token} />
                ))}
            </div>
            )}
        </main>
        </div>
    );
}