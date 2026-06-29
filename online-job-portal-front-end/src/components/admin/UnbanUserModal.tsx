import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { LockOpen, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/redux/features/admin/adminApi';

interface UnbanUserModalProps {
  open: boolean;
  user: User | null;
  isLoading: boolean;
  onUnban: (userId: string) => Promise<void>;
  onClose: () => void;
}

export function UnbanUserModal({ open, user, isLoading, onUnban, onClose }: UnbanUserModalProps) {
  const handleUnban = async () => {
    if (!user) return;

    try {
      await onUnban(user._id);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi gỡ ban user');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockOpen className="h-5 w-5 text-green-600" />
            Gỡ Ban User: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Email: <span className="font-mono text-sm">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ban Info */}
          {user.lockUntil && (
            <div className="rounded-md bg-amber-50 p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Ban sẽ hết hạn vào:</p>
                <p className="font-mono">
                  {new Date(user.lockUntil).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          )}

          {/* Action Info */}
          <div className="rounded-md bg-blue-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Thông tin:</p>
              <p>Ban sẽ được gỡ ngay lập tức. User có thể đăng nhập lại.</p>
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
            onClick={handleUnban}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <LockOpen className="h-4 w-4" />
                Xác nhận Gỡ Ban
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
