"use client";

import { AlertTriangle, Award } from "lucide-react";
import { CertificateCard } from "@/components/certificates/certificate-card";
import { useCertificates, Certificate } from "@/hooks/use-certificates";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MyCertificatesContent() {
  const { data: certificates, isLoading, isError, refetch } = useCertificates();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse border border-white/10" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center bg-red-500/5 rounded-2xl border border-red-500/10">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <div className="space-y-1">
          <p className="text-white font-bold">Could not load certificates</p>
          <p className="text-gray-400 text-sm">Verify your connection and try again.</p>
        </div>
        <Button
          onClick={() => void refetch()}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/5 rounded-2xl border border-white/5">
        <Award className="w-12 h-12 text-gray-600" />
        <div className="space-y-1">
          <p className="text-white font-semibold">No certificates earned yet</p>
          <p className="text-gray-500 text-sm">Complete courses to see them here.</p>
        </div>
        <Link href="/courses">
          <Button variant="default" className="text-green-500 hover:text-green-400">
            Browse Courses
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {certificates.map((cert: Certificate) => (
        <CertificateCard key={cert.id} certificate={cert} />
      ))}
    </div>
  );
}
