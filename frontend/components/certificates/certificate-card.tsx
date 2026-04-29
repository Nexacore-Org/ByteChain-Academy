"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Download, 
  Share2, 
  Check, 
  ExternalLink,
  Loader2,
  Calendar,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Certificate } from "@/hooks/use-certificates";
import { api } from "@/lib/api";

interface CertificateCardProps {
  certificate: Certificate;
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use the API base for downloading
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const token = localStorage.getItem("auth_token");
      
      const res = await fetch(`${baseUrl}/api/v1/certificates/${certificate.id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to download certificate");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Certificate-${certificate.courseName.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    const verificationUrl = `${window.location.origin}/verify-certificate?hash=${certificate.certificateHash}`;
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isRevoked = certificate.status === "revoked";

  return (
    <Card className={`overflow-hidden border-white/10 bg-[#0d0d0d] transition-all hover:border-green-500/30 ${isRevoked ? 'opacity-75 grayscale' : ''}`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green-500 to-emerald-700" />
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Award className="w-6 h-6 text-green-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                {certificate.courseName}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(certificate.issuedAt)}
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  <span className="text-gray-500 uppercase">Hash:</span>
                  <span className="text-green-400/80">{certificate.certificateHash.substring(0, 10)}...</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:self-center">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 gap-2"
              onClick={handleShare}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? "Copied" : "Share"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 gap-2"
              onClick={handleDownload}
              disabled={isDownloading || isRevoked}
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download
            </Button>

            <Button
              size="sm"
              className="bg-green-500 hover:bg-green-400 text-[#002E20] font-bold gap-2"
              asChild
            >
              <a href={`/verify-certificate?hash=${certificate.certificateHash}`}>
                <ShieldCheck className="w-4 h-4" />
                Verify
              </a>
            </Button>
          </div>
        </div>
        
        {isRevoked && (
          <div className="mt-4 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider text-center">
            This certificate has been revoked
          </div>
        )}
      </CardContent>
    </Card>
  );
}
