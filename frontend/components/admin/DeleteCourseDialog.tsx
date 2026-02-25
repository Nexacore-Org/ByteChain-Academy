"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  isPublished: boolean;
  onConfirm: () => Promise<void>;
  isDeleting?: boolean;
}

export function DeleteCourseDialog({
  open,
  onOpenChange,
  courseTitle,
  isPublished,
  onConfirm,
  isDeleting = false,
}: DeleteCourseDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete course?</DialogTitle>
          <DialogDescription asChild>
            <p className="text-gray-400">
              {isPublished ? (
                <>
                  This course is published. Learners with active progress will be
                  affected. This will permanently delete{" "}
                  <strong className="text-white">{courseTitle}</strong> and all
                  its lessons. This cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete{" "}
                  <strong className="text-white">{courseTitle}</strong> and all
                  its lessons. This cannot be undone.
                </>
              )}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
