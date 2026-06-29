import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/admin/select-custom';
import { Textarea } from '@/components/ui/textarea';
import { Ban, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/redux/features/admin/adminApi';

const BAN_DURATIONS = [
  { label: '15 phút', value: '15_minutes' },
  { label: '30 phút', value: '30_minutes' },
  { label: '1 giờ', value: '1_hour' },
  { label: '6 giờ', value: '6_hours' },
  { label: '12 giờ', value: '12_hours' },
  { label: '1 ngày', value: '24_hours' },
  { label: '3 ngày', value: '3_days' },
  { label: '1 tuần', value: '7_days' },
  { label: '2 tuần', value: '15_days' },
  { label: '1 tháng', value: '1_month' },
  { label: '3 tháng', value: '3_months' },
  { label: '6 tháng', value: '6_months' },
  { label: '1 năm', value: '1_year' },
];

interface BanUserModalProps {
  open: boolean;
  user: User | null;
  isLoading: boolean;
  onBan: (userId: string, duration: string, reason: string) => Promise<void>;
  onClose: () => void;
}

export function BanUserModal({ open, user, isLoading, onBan, onClose }: BanUserModalProps) {
  const [duration, setDuration] = useState('24_hours');
  const [reason, setReason] = useState('');

  const handleBan = async () => {
    if (!user) return;

    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do ban');
      return;
    }

    if (reason.length < 10) {
      toast.error('Lý do ban phải tối thiểu 10 ký tự');
      return;
    }

    try {
      await onBan(user._id, duration, reason);
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi ban user');
    }
  };

  const resetForm = () => {
    setDuration('24_hours');
    setReason('');
  };

  if (!user) return null;

  const durationLabel = BAN_DURATIONS.find(d => d.value === duration)?.label || '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Ban User: {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Email: <span className="font-mono text-sm">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ban Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thời hạn ban</label>
            <Select value={duration} onValueChange={setDuration} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAN_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Tài khoản sẽ bị khóa trong {durationLabel}
            </p>
          </div>

          {/* Ban Reason */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do ban</label>
            <Textarea
              placeholder="Nhập lý do ban user này (tối thiểu 10 ký tự)..."
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

          {/* Warning */}
          <div className="rounded-md bg-amber-50 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Lưu ý:</p>
              <p>User sẽ không thể đăng nhập trong thời gian ban.</p>
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
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            onClick={handleBan}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Ban className="h-4 w-4" />
                Xác nhận Ban
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
