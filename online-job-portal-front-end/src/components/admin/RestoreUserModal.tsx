import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/redux/features/admin/adminApi';

interface RestoreUserModalProps {
  open: boolean;
  user: User | null;
  isLoading: boolean;
  onRestore: (userId: string) => Promise<void>;
  onClose: () => void;
}

export function RestoreUserModal({ open, user, isLoading, onRestore, onClose }: RestoreUserModalProps) {
  const handleRestore = async () => {
    if (!user) return;

    try {
      await onRestore(user._id);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi khôi phục user');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-green-600" />
            Khôi Phục User: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Email: <span className="font-mono text-sm">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info */}
          <div className="rounded-md bg-blue-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Thông tin:</p>
              <p>Tài khoản sẽ được khôi phục và có thể hoạt động bình thường.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <ButtonLowercase
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </ButtonLowercase>
          <ButtonLowercase
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={handleRestore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Xác nhận Khôi Phục
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
