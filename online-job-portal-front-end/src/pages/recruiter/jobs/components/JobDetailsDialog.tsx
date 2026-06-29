import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import JobDetails from "./JobDetails";

interface JobDetailsDialogProps {
  open: boolean;
  job: any;
  isLoading: boolean;
  onClose: () => void;
}

export default function JobDetailsDialog({ open, job, isLoading, onClose }: JobDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl  w-60vw h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-default">Job Details</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2">Loading job details...</span>
          </div>
        ) : job ? (
          <div className="overflow-y-auto">
            <JobDetails job={job} />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">Failed to load job details.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
