import { FileText } from 'lucide-react';
import { toast } from 'sonner';

import CVViewer from './CVViewer.tsx';
import CVUploader from '@/features/job-seeker/components/upload/CVUploader.tsx';
import { useUpdateProfileMutation } from '@/redux/features/profile';

type CVSectionProps = {
  currentCVUrl?: string;
  currentCVName?: string;
};

export default function CVSection({ currentCVUrl, currentCVName }: CVSectionProps) {
  const [updateProfile] = useUpdateProfileMutation();

  return (
    <section id="cv" className="scroll-mt-24">
      <div className="w-full p-6 bg-card rounded-lg shadow-md border border-border">
        <div className="w-full mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">CV Management</h2>
              <p className="text-sm text-muted-foreground">
                Upload and manage your curriculum vitae
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* CV Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-foreground mb-4">Upload CV</h3>
            <CVUploader
              currentCVUrl={currentCVUrl}
              currentCVName={currentCVName}
              onUploadSuccess={async (cvUrl) => {
                try {
                  console.log('[CVSection] Updating profile with new CV:', cvUrl);
                  await updateProfile({ cv: cvUrl }).unwrap();
                  toast.success('Profile updated with new CV!');
                } catch (error: any) {
                  console.error('[CVSection] Failed to update profile:', error);
                  toast.error(error?.data?.message || 'Failed to update profile with new CV');
                }
              }}
            />
          </div>

          {/* CV Viewer Section */}
          {currentCVUrl && (
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">View CV</h3>
              <CVViewer cvUrl={currentCVUrl} cvName={currentCVName} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
