import { useState, useEffect } from 'react';
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
import { 
  useUpdateInterviewMutation,
  type Interview,
  type UpdateInterviewRequest 
} from '@/redux/features/interviews/interviewApi';

interface EditScheduleModalProps {
  open: boolean;
  onClose: () => void;
  interview: Interview;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  open,
  onClose,
  interview,
}) => {
  const [updateInterview, { isLoading }] = useUpdateInterviewMutation();

  const [formData, setFormData] = useState<UpdateInterviewRequest>({
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    location: '',
    meetingLink: '',
    note: '',
  });

  // Load interview data when modal opens
  useEffect(() => {
    if (open && interview) {
      // Parse date from ISO string to YYYY-MM-DD
      const date = new Date(interview.scheduledDate);
      const formattedDate = date.toISOString().split('T')[0];

      setFormData({
        scheduledDate: formattedDate,
        scheduledTime: interview.scheduledTime,
        duration: interview.duration,
        location: interview.location || '',
        meetingLink: interview.meetingLink || '',
        note: interview.note || '',
      });
    }
  }, [open, interview]);

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
    const loadingToast = toast.loading('Updating interview schedule...');
    onClose();

    try {
      await updateInterview({
        id: interview._id,
        data: formData,
      }).unwrap();
      toast.success('Interview schedule updated successfully', { id: loadingToast });
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update interview schedule', { id: loadingToast });
    }
  };

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Interview Schedule</DialogTitle>
          <div className="text-sm text-gray-600 mt-2">
            <p>
              <span className="font-medium">Candidate:</span> {interview.jobSeekerId.firstName}{' '}
              {interview.jobSeekerId.lastName}
            </p>
            <p>
              <span className="font-medium">Position:</span> {interview.jobId.title}
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Interview Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                min={today}
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">
                Interview Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              Duration <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.duration?.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
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
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-gray-500 text-sm">(or Meeting Link required)</span>
            </Label>
            <div className="relative">
              <Icons.mapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                placeholder="e.g., Office Building A, Room 301"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">
              Meeting Link <span className="text-gray-500 text-sm">(or Location required)</span>
            </Label>
            <div className="relative">
              <Icons.link className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                value={formData.meetingLink}
                onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Additional Notes</Label>
            <Textarea
              id="note"
              placeholder="Any additional information for the candidate..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">{formData.note?.length || 0}/500</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <ButtonLowercase type="button" variant="outline" onClick={onClose}>
              Cancel
            </ButtonLowercase>
            <ButtonLowercase type="submit" disabled={isLoading}>
              {isLoading && <Icons.loader className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </ButtonLowercase>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
