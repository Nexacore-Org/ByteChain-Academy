"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RevokeCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientName: string;
  courseName: string;
  onConfirm: () => Promise<void>;
}

export function RevokeCertificateDialog({
  open,
  onOpenChange,
  recipientName,
  courseName,
  onConfirm,
}: RevokeCertificateDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Revoke certificate?</DialogTitle>
          <DialogDescription asChild>
            <p>
              This will permanently revoke{" "}
              <strong className="font-semibold text-white">{recipientName}</strong>
              &apos;s certificate for{" "}
              <strong className="font-semibold text-white">{courseName}</strong>.
              They will no longer be able to verify it. This cannot be undone.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Revoking...
              </>
            ) : (
              "Revoke"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
