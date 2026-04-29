"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  ShieldCheck, 
  AlertTriangle, 
  User, 
  BookOpen, 
  Calendar,
  ExternalLink,
  Award,
  CheckCircle2
} from "lucide-react";
import { VerificationResult } from "@/hooks/use-certificates";

interface VerificationResultViewProps {
  result: VerificationResult;
  hash: string;
}

export function VerificationResultView({ result, hash }: VerificationResultViewProps) {
  if (!result.valid) {
    return (
      <Card className="border-red-500/30 bg-red-500/5 animate-in fade-in slide-in-from-top-4 duration-500">
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Certificate Not Found</h3>
            <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">
              We couldn't find a valid certificate with the hash provided. This could mean the hash is incorrect or the certificate has not been issued yet.
            </p>
          </div>
          <div className="pt-4 font-mono text-xs text-red-400/60 break-all">
            Hash: {hash}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isRevoked = result.revoked === true;

  return (
    <Card className={`relative overflow-hidden border-green-500/30 bg-[#0d0d0d] shadow-2xl shadow-green-500/10 animate-in fade-in zoom-in duration-500 ${isRevoked ? 'border-yellow-500/30 shadow-yellow-500/5' : ''}`}>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-3xl rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -ml-32 -mb-32" />
      
      <div className={`px-6 py-4 flex items-center justify-between border-b ${isRevoked ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
        <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${isRevoked ? 'text-yellow-400' : 'text-green-400'}`}>
          <ShieldCheck className="w-4 h-4" />
          {isRevoked ? 'Revoked Certificate' : 'Authentic Certificate'}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${isRevoked ? 'bg-yellow-500 text-black' : 'bg-green-500 text-[#002E20]'}`}>
          {isRevoked ? 'Invalidated' : 'Verified ✓'}
        </div>
      </div>

      <CardContent className="p-8 md:p-12 space-y-10 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
           <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 rotate-3 transform transition-transform hover:rotate-0 duration-300 ${isRevoked ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
              <Award className={`w-12 h-12 ${isRevoked ? 'text-yellow-500' : 'text-green-500'}`} />
           </div>
           <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Certificate of Completion
           </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <User className="w-3 h-3" />
              Recipient Name
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {result.recipientName || "Anonymous Learner"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <BookOpen className="w-3 h-3" />
              Course Completed
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">
              {result.courseOrProgram || "Blockchain Specialization"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <Calendar className="w-3 h-3" />
              Issue Date
            </div>
            <p className="text-xl font-semibold text-gray-200">
              {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : "Unknown"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              Status
            </div>
            <p className={`text-xl font-bold ${isRevoked ? 'text-yellow-400' : 'text-green-400'}`}>
              {isRevoked ? 'Revoked' : 'Active & Valid'}
            </p>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Blockchain Verification Hash</span>
              <ShieldCheck className="w-4 h-4 text-green-500/20" />
            </div>
            <p className="text-xs font-mono text-gray-400 break-all leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
              {hash}
            </p>
            <div className="flex justify-end pt-2">
               <a 
                 href={`https://explorer.solana.com/address/${hash}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-1 text-[10px] text-green-500/60 hover:text-green-400 transition-colors font-bold uppercase tracking-tighter"
               >
                 View on Solana Explorer
                 <ExternalLink className="w-3 h-3" />
               </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
