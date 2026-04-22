"use client";

import { useRouter } from "next/navigation";
import {
    Clipboard,
    Check,
    ShieldCheck,
    FileText,
    Loader2,
    X,
} from "lucide-react";
import { useCopyVerificationCode } from "@/hooks/useCopyVerificationCode";
import { useCertificateDownload } from "@/hooks/useCertificateDownload";

export interface Certificate {
    id: string;
    courseName: string;
    issuedAt: string; // ISO date string
    verificationCode: string;
    status: "active" | "revoked";
}

interface CertificateCardProps {
    certificate: Certificate;
    token: string;
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function truncateCode(code: string, len = 20) {
    return code.length > len ? code.slice(0, len) + "..." : code;
}

export function CertificateCard({ certificate, token }: CertificateCardProps) {
    const router = useRouter();
    const { copyState, errorCode, copy } = useCopyVerificationCode();
    const { downloadStates, download, dismissError } = useCertificateDownload();

    const isRevoked = certificate.status === "revoked";
    const dlState = downloadStates[certificate.id] ?? "idle";
    const hasDownloadError = dlState === "error";

    const handleVerify = () => {
        router.push(`/verify-certificate/${certificate.verificationCode}`);
    };

    const handleDownload = () => {
        if (isRevoked || dlState === "loading") return;
        download(certificate.id, certificate.courseName, token);
    };

    return (
        <div className="relative w-full">
        {/* Card */}
        <div
            className={`
            w-full rounded-xl bg-[#1a1a2e] border border-white/10 p-5
            ${isRevoked ? "border-l-4 border-l-red-500" : ""}
            `}
        >
            {/* Revoked badge */}
            {isRevoked && (
            <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/40">
                Revoked
            </span>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: info */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <p className="text-white font-semibold text-base leading-tight">
                {certificate.courseName}
                </p>
                <p className="text-gray-400 text-xs">
                Issued {formatDate(certificate.issuedAt)}
                </p>

                {/* Verification code row */}
                <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs text-green-400/80 truncate max-w-[200px]">
                    {truncateCode(certificate.verificationCode)}
                </span>

                {/* Copy button */}
                <div className="relative">
                    <button
                    onClick={() => copy(certificate.verificationCode)}
                    className="p-1 rounded hover:bg-white/10 transition-colors duration-100 text-gray-400 hover:text-green-400"
                    aria-label="Copy verification code"
                    >
                    {copyState === "copied" ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <Clipboard className="w-3.5 h-3.5" />
                    )}
                    </button>

                    {/* Error tooltip */}
                    {copyState === "error" && errorCode && (
                    <div className="absolute top-full left-0 mt-1 z-10 bg-gray-800 border border-white/20 rounded-md px-3 py-2 text-xs text-gray-200 whitespace-nowrap shadow-lg">
                        Could not copy. Code:{" "}
                        <span className="font-mono text-green-400 select-all">
                        {errorCode}
                        </span>
                    </div>
                    )}
                </div>
                </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Verify button */}
                <button
                onClick={handleVerify}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-white text-sm font-semibold transition-colors duration-150"
                >
                <ShieldCheck className="w-4 h-4" />
                {isRevoked ? "View Status" : "Verify"}
                </button>

                {/* Download button */}
                <div className="relative flex flex-col items-end">
                <button
                    onClick={handleDownload}
                    disabled={isRevoked || dlState === "loading"}
                    title={isRevoked ? "Certificate has been revoked" : undefined}
                    className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors duration-150
                    ${
                        isRevoked
                        ? "border-white/10 text-gray-600 cursor-not-allowed bg-transparent"
                        : dlState === "loading"
                        ? "border-white/20 text-gray-400 cursor-wait bg-white/5"
                        : "border-white/20 text-gray-200 hover:bg-white/10 bg-transparent"
                    }
                    `}
                >
                    {dlState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                    <FileText className="w-4 h-4" />
                    )}
                    {dlState === "loading" ? "Preparing..." : "Download"}
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Download error message below card */}
        {hasDownloadError && (
            <div className="flex items-center justify-between mt-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <span>Download failed. Please try again.</span>
            <button
                onClick={() => dismissError(certificate.id)}
                className="ml-3 p-0.5 rounded hover:bg-red-500/20 transition-colors"
                aria-label="Dismiss error"
            >
                <X className="w-4 h-4" />
            </button>
            </div>
        )}
        </div>
    );
    }