import { useState } from 'react';
import { toast } from 'sonner';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons/icons';
import { useCreateInterviewMutation } from '@/redux/features/interviews/interviewApi';
import type { CreateInterviewRequest } from '@/redux/features/interviews/interviewApi';

interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  jobId: string;
  jobSeekerId: string;
  candidateName: string;
  jobTitle: string;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export const ScheduleInterviewModal: React.FC<ScheduleInterviewModalProps> = ({
  open,
  onClose,
  applicationId,
  jobId,
  jobSeekerId,
  candidateName,
  jobTitle,
}) => {
  const [createInterview, { isLoading }] = useCreateInterviewMutation();

  const [formData, setFormData] = useState<CreateInterviewRequest>({
    jobId,
    applicationId,
    jobSeekerId,
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    location: '',
    meetingLink: '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!formData.location && !formData.meetingLink) {
      toast.error('Please provide either location or meeting link');
      return;
    }

    // ✅ Optimistic update: Close modal and show loading toast immediately
    const loadingToast = toast.loading('Scheduling interview...');
    onClose();
    resetForm();

    try {
      await createInterview(formData).unwrap();
      toast.success('Interview scheduled successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to schedule interview', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      jobId,
      applicationId,
      jobSeekerId,
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      location: '',
      meetingLink: '',
      note: '',
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Schedule Interview</DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <p>
              <span className="font-medium">Candidate:</span> {candidateName}
            </p>
            <p>
              <span className="font-medium">Position:</span> {jobTitle}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="required">
                Interview Date
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="time" className="required">
                Interview Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <Label htmlFor="duration" className="required">
              Duration
            </Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, duration: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location (In-person)</Label>
            <Input
              id="location"
              placeholder="e.g., Floor 5, ABC Building, 123 Street"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {/* Meeting Link */}
          <div>
            <Label htmlFor="meetingLink">Meeting Link (Online)</Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="e.g., https://meet.google.com/..."
              value={formData.meetingLink}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide either location or meeting link (or both)
            </p>
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">Additional Notes</Label>
            <Textarea
              id="note"
              placeholder="e.g., Please bring your portfolio and ID card"
              value={formData.note}
              onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.note?.length || 0}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <ButtonLowercase type="button" variant="outline" onClick={handleClose}>
              Cancel
            </ButtonLowercase>
            <ButtonLowercase type="submit" disabled={isLoading}>
              {isLoading && <Icons.loader className="w-4 h-4 mr-2 animate-spin" />}
              Schedule Interview
            </ButtonLowercase>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
