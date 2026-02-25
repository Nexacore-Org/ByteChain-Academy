export function CertificateCardSkeleton() {
    return (
        <div className="w-full rounded-xl bg-[#1a1a2e] border border-white/10 p-5 animate-pulse">
        <div className="flex items-center justify-between gap-4">
            {/* Left: text rows */}
            <div className="flex-1 space-y-3">
            {/* Course name */}
            <div className="h-5 w-2/3 rounded bg-white/10" />
            {/* Issued date */}
            <div className="h-3.5 w-1/4 rounded bg-white/10" />
            {/* Code row */}
            <div className="h-4 w-1/2 rounded bg-white/10" />
            </div>
            {/* Right: button placeholders */}
            <div className="flex gap-2 shrink-0">
            <div className="h-9 w-24 rounded-lg bg-white/10" />
            <div className="h-9 w-28 rounded-lg bg-white/10" />
            </div>
        </div>
        </div>
    );
}