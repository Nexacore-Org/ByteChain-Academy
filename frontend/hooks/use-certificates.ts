import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Certificate {
  id: string;
  courseName: string;
  issuedAt: string;
  certificateHash: string;
  status: "active" | "revoked";
}

export function useCertificates() {
  return useQuery({
    queryKey: ["certificates", "my"],
    queryFn: async () => {
      const data = await api.get<any[]>("/certificates/my");
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      
      return data.map((cert) => ({
        id: cert.id,
        courseName: cert.courseOrProgram || "Unknown Course",
        issuedAt: cert.issuedAt || cert.createdAt,
        certificateHash: cert.certificateHash || "",
        status: (cert.isValid === false ? "revoked" : "active") as "active" | "revoked",
      })) as Certificate[];
    },
    retry: 1,
  });
}

export interface VerificationResult {
  valid: boolean;
  recipientName?: string;
  courseOrProgram?: string;
  issuedAt?: string;
  revoked?: boolean;
}

export function useCertificateVerification(hash: string) {
  return useQuery({
    queryKey: ["certificates", "verify", hash],
    queryFn: async () => {
      if (!hash) return null;
      try {
        const res = await api.get<any>(`/certificates/verify/${hash}`);
        // Map backend CertificateVerificationResultDto to our VerificationResult
        return {
          valid: res.isValid,
          recipientName: res.certificate?.recipientName,
          courseOrProgram: res.certificate?.courseOrProgram,
          issuedAt: res.certificate?.issuedAt,
          revoked: res.certificate?.status === 'revoked'
        } as VerificationResult;
      } catch (err) {
        console.error("Verification error:", err);
        return { valid: false } as VerificationResult;
      }
    },
    enabled: !!hash,
    retry: false,
  });
}
