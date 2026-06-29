"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Btn";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  confirmVariant?: "default" | "primary" | "outline" | "outlineOrange" | "destructive" | "custom";
  cancelVariant?: "outline" | "custom" | "default";

  onConfirm: () => void;
  onCancel: () => void;

  loading?: boolean; // nếu bạn muốn disable confirm khi đang xử lý
}

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",

  confirmVariant = "default",
  cancelVariant = "outline",

  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant={cancelVariant} onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>

          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
