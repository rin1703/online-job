import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

import { ButtonLowercase } from '@/components/ui/button-lowercase.tsx';

function ProfileHeader() {
  const navigate = useNavigate();

  const handleGoToSettings = () => {
    navigate('/job-seeker/settings');
  };

  const handleShareProfile = async () => {
    // Replace with your actual share profile logic
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard!');
    } catch (_error) {
      toast.error('Failed to copy profile link');
    }
  };

  return (
    <div className="mb-1 flex flex-col items-start justify-between gap-2 sm:mb-4 sm:flex-row sm:items-center md:mb-6">
      <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">Profile</h1>

      <div className="flex w-full gap-2 sm:w-auto sm:gap-3">
        <ButtonLowercase
          variant="orange"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-3xl sm:w-auto sm:flex-initial sm:px-4"
          onClick={handleGoToSettings}
        >
          <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-sm font-semibold sm:hidden">Settings</span>
        </ButtonLowercase>

        <ButtonLowercase
          variant="outline"
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-3xl border-orange-500 text-orange-500 sm:flex-initial sm:px-6"
          onClick={handleShareProfile}
        >
          <span className="text-sm font-semibold sm:text-base">Share</span>
        </ButtonLowercase>
      </div>
    </div>
  );
}

export default ProfileHeader;
