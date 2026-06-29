import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Textarea } from '@/components/ui/textarea';
import { XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Recruiter } from '@/redux/features/admin/adminApi';

interface RejectRecruiterModalProps {
  open: boolean;
  recruiter: Recruiter | null;
  isLoading: boolean;
  onReject: (recruiterId: string, reason: string) => Promise<void>;
  onClose: () => void;
}

export function RejectRecruiterModal({
  open,
  recruiter,
  isLoading,
  onReject,
  onClose,
}: RejectRecruiterModalProps) {
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    if (!recruiter) return;

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    if (reason.length < 10) {
      toast.error('Lý do từ chối phải tối thiểu 10 ký tự');
      return;
    }

    try {
      await onReject(recruiter._id, reason);
      setReason('');
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'Lỗi khi từ chối recruiter');
    }
  };

  if (!recruiter) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Từ Chối Recruiter: {recruiter.fullName}
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
          </div>

          {/* Warning Alert */}
          <div className="rounded-md bg-red-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium">Cảnh báo:</p>
              <p>Recruiter sẽ nhận email thông báo từ chối. Bạn phải cung cấp lý do cụ thể.</p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do từ chối</label>
            <Textarea
              placeholder="Ví dụ: Mã số thuế không hợp lệ, tên công ty không khớp..."
              value={reason}
              onChange={e => setReason(e.target.value)}
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
          <ButtonLowercase variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </ButtonLowercase>
          <ButtonLowercase
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleReject}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Xác nhận Từ Chối
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
