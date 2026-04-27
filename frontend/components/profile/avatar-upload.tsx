"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface AvatarUploadProps {
  currentAvatar?: string;
  fallbackName: string;
  onUploadSuccess: (avatarUrl: string) => void;
}

function initials(name: string) {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AvatarUpload({
  currentAvatar,
  fallbackName,
  onUploadSuccess,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(file);
    setPendingFile(file);
    setPreviewUrl(nextPreview);
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", pendingFile);
      
      const payload = await apiFetch<{ avatar?: string; avatarUrl?: string }>("/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const avatarUrl = payload.avatarUrl ?? payload.avatar;
      if (!avatarUrl) {
        throw new Error("Avatar URL missing in response");
      }

      onUploadSuccess(avatarUrl);
      toast.success("Avatar updated");
      clearPreview();
    } catch (err) {
      console.error("Avatar upload error:", err);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const displayAvatar = previewUrl ?? currentAvatar;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-[#00ff88] to-[#00d88b] flex items-center justify-center text-[#002E20] text-xl font-bold overflow-hidden">
        {displayAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayAvatar} alt={fallbackName} className="w-full h-full object-cover" />
        ) : (
          initials(fallbackName)
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {!pendingFile ? (
          <Button type="button" variant="outline" size="sm" onClick={handlePick}>
            <Camera className="w-4 h-4" />
            Change Avatar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => void handleUpload()} disabled={isUploading}>
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Save Avatar"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={clearPreview} disabled={isUploading}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
