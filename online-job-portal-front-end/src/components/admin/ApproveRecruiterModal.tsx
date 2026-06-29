import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Recruiter } from '@/redux/features/admin/adminApi';

interface ApproveRecruiterModalProps {
  open: boolean;
  recruiter: Recruiter | null;
  isLoading: boolean;
  onApprove: (recruiterId: string) => Promise<void>;
  onClose: () => void;
}

export function ApproveRecruiterModal({
  open,
  recruiter,
  isLoading,
  onApprove,
  onClose,
}: ApproveRecruiterModalProps) {
  const handleApprove = async () => {
    if (!recruiter) return;

    try {
      await onApprove(recruiter._id);
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi duyệt recruiter');
    }
  };

  if (!recruiter) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Duyệt Recruiter: {recruiter.fullName}
          </DialogTitle>
          <DialogDescription>
            Công ty: <span className="font-medium">{recruiter.companyName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Recruiter Info */}
          <div className="space-y-2 text-sm">
            <p><b>Email:</b> {recruiter.email}</p>
            <p><b>Phone:</b> {recruiter.phone}</p>
            <p><b>Company:</b> {recruiter.companyName}</p>
            <p><b>Applied:</b> {new Date(recruiter.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          {/* Info Alert */}
          <div className="rounded-md bg-blue-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Khi duyệt:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Recruiter sẽ nhận email kích hoạt</li>
                <li>Link kích hoạt có hạn 30 phút</li>
                <li>Có thể gửi lại email kích hoạt nếu cần</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <ButtonLowercase variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </ButtonLowercase>
          <ButtonLowercase
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            onClick={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Xác nhận Duyệt
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
