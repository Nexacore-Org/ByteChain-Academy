"use client";

import { MyCertificatesContent } from "@/components/profile/my-certificates-content";
import { GraduationCap } from "lucide-react";

export function MyCertificatesPageContent() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#00ff88]/15 shrink-0">
          <GraduationCap className="w-5 h-5 text-[#00ff88]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">My Certificates</h2>
          <p className="text-sm text-gray-400">Your earned certificates from ByteChain Academy</p>
        </div>
      </div>
      <MyCertificatesContent />
    </section>
  );
}

export default MyCertificatesPageContent;