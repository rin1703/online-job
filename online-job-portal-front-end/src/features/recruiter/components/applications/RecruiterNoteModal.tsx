import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ApplicationStatus } from '@/features/recruiter/application.type';
import { Loader2 } from 'lucide-react';

interface RecruiterNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: ApplicationStatus;
  currentNote?: string;
  onConfirm: (note: string) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_LABELS: Record<ApplicationStatus, { title: string; color: string }> = {
  [ApplicationStatus.PENDING]: { title: 'Pending', color: 'text-gray-600' },
  [ApplicationStatus.REVIEWED]: { title: 'Reviewed', color: 'text-blue-600' },
  [ApplicationStatus.INTERVIEW_SCHEDULED]: { title: 'Interview Scheduled', color: 'text-purple-600' },
  [ApplicationStatus.APPROVED]: { title: 'Approved', color: 'text-green-600' },
  [ApplicationStatus.REJECTED]: { title: 'Rejected', color: 'text-red-600' },
  [ApplicationStatus.WITHDRAWN]: { title: 'Withdrawn', color: 'text-orange-600' },
};

export const RecruiterNoteModal: React.FC<RecruiterNoteModalProps> = ({
  open,
  onOpenChange,
  status,
  currentNote = '',
  onConfirm,
  isLoading = false,
}) => {
  const [note, setNote] = useState(currentNote);

  const handleConfirm = async () => {
    // ✅ Optimistic update: Close modal immediately for better UX
    onOpenChange(false);
    await onConfirm(note.trim());
  };

  const handleCancel = () => {
    setNote(currentNote); // Reset to original
    onOpenChange(false);
  };

  const statusInfo = STATUS_LABELS[status];
  const maxLength = 1000;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Update Status to{' '}
            <span className={statusInfo.color}>{statusInfo.title}</span>
          </DialogTitle>
          <DialogDescription>
            Add an optional note for the candidate. This note will be visible to the job seeker
            and included in their notification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="recruiter-note">Recruiter Note (Optional)</Label>
          <Textarea
            id="recruiter-note"
            placeholder="e.g., Great qualifications! We'll contact you soon for the interview..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={maxLength}
            rows={6}
            className="resize-none"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            {note.length}/{maxLength} characters
          </p>
        </div>

        <DialogFooter className="gap-2">
          <ButtonLowercase
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </ButtonLowercase>
          <ButtonLowercase
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              status === ApplicationStatus.APPROVED
                ? 'bg-green-600 hover:bg-green-700'
                : status === ApplicationStatus.REJECTED
                ? 'bg-red-600 hover:bg-red-700'
                : status === ApplicationStatus.INTERVIEW_SCHEDULED
                ? 'bg-purple-600 hover:bg-purple-700'
                : ''
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Confirm'
            )}
          </ButtonLowercase>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
