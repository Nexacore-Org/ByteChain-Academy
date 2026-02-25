"use client";

import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export function CertificatesEmptyState() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-green-500/10">
            <GraduationCap className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">No certificates yet</h2>
        <p className="text-sm text-gray-400 max-w-xs">
            Complete all lessons in a course to earn your certificate.
        </p>
        <button
            onClick={() => router.push("/courses")}
            className="mt-2 px-6 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-white font-semibold text-sm transition-colors duration-150"
        >
            Browse Courses
        </button>
        </div>
    );
}