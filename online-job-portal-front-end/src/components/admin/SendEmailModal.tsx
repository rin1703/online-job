import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/redux/features/admin/adminApi';

interface SendEmailModalProps {
  open: boolean;
  user: User | null;
  isLoading: boolean;
  onSendEmail: (userId: string, subject: string, body: string) => Promise<void>;
  onClose: () => void;
}

export function SendEmailModal({ open, user, isLoading, onSendEmail, onClose }: SendEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSendEmail = async () => {
    if (!user) return;

    if (!subject.trim()) {
      toast.error('Vui lòng nhập tiêu đề email');
      return;
    }

    if (!body.trim()) {
      toast.error('Vui lòng nhập nội dung email');
      return;
    }

    try {
      await onSendEmail(user._id, subject, body);
      resetForm();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi gửi email');
    }
  };

  const resetForm = () => {
    setSubject('');
    setBody('');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Gửi Email
          </DialogTitle>
          <DialogDescription>
            Gửi email đến: <span className="font-mono text-sm">{user.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tiêu đề</label>
            <Input
              placeholder="Nhập tiêu đề email..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung</label>
            <Textarea
              placeholder="Nhập nội dung email..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={isLoading}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              {body.length}/5000 ký tự
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
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            onClick={handleSendEmail}
            disabled={isLoading || !subject.trim() || !body.trim()}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Gửi Email
              </>
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
