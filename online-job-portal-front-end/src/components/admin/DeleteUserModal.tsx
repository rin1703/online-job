import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/redux/features/admin/adminApi';

interface DeleteUserModalProps {
  open: boolean;
  user: User | null;
  isLoading: boolean;
  onDelete: (userId: string, reason?: string) => Promise<void>;
  onClose: () => void;
}

export function DeleteUserModal({ open, user, isLoading, onDelete, onClose }: DeleteUserModalProps) {
  const [reason, setReason] = useState('');

  const handleDelete = async () => {
    if (!user) return;

    try {
      await onDelete(user._id, reason || undefined);
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xóa user');
    }
  };

  const resetForm = () => {
    setReason('');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Xóa User: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Email: <span className="font-mono text-sm">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="rounded-md bg-red-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Cảnh báo:</p>
              <p>Tài khoản sẽ bị soft delete (ẩn nhưng dữ liệu vẫn được bảo tồn).</p>
              <p>Bạn có thể khôi phục sau này nếu cần.</p>
            </div>
          </div>

          {/* Delete Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do xóa (tùy chọn)</label>
            <Textarea
              placeholder="Nhập lý do xóa user này..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {reason.length}/500 ký tự
            </p>
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
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Xác nhận Xóa
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
