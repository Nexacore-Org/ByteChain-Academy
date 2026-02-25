import { useState } from "react";

type DownloadState = "idle" | "loading" | "error";

export function useCertificateDownload() {
    const [downloadStates, setDownloadStates] = useState<
        Record<string, DownloadState>
    >({});
    const [downloadErrors, setDownloadErrors] = useState<
        Record<string, boolean>
    >({});

    const slugify = (name: string) =>
        name
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");

    const download = async (
        certificateId: string,
        courseName: string,
        token: string
    ) => {
        setDownloadStates((prev) => ({ ...prev, [certificateId]: "loading" }));
        setDownloadErrors((prev) => ({ ...prev, [certificateId]: false }));

        try {
        const res = await fetch(`/api/certificates/${certificateId}/download`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Download failed");

        const contentType = res.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
            // API returned a pre-signed URL
            const data = await res.json();
            window.location.href = data.url;
        } else {
            // API returned a blob
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const slug = slugify(courseName);
            a.href = objectUrl;
            a.download = `Bytechain-Academy-Certificate-${slug}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
        }

        setDownloadStates((prev) => ({ ...prev, [certificateId]: "idle" }));
        } catch {
        setDownloadStates((prev) => ({ ...prev, [certificateId]: "error" }));
        }
    };

    const dismissError = (certificateId: string) => {
        setDownloadErrors((prev) => ({ ...prev, [certificateId]: false }));
        setDownloadStates((prev) => ({ ...prev, [certificateId]: "idle" }));
    };

    return { downloadStates, downloadErrors, download, dismissError };
}