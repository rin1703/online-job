// src/pages/job-seeker/settings/security/index.tsx

import { useEffect } from "react";
import { SecuritySection } from "@/features/recruiter/components/settings/SecuritySection";

export default function SecuritySettingsPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSaveSecurity = () => {
    console.log("Save security settings");
    // TODO: Add API call here
    // Example:
    // try {
    //   const response = await updateSecuritySettings({
    //     currentPassword,
    //     newPassword,
    //     twoFactorEnabled
    //   });
    //   toast.success('Security settings updated successfully');
    // } catch (error) {
    //   toast.error('Failed to update security settings');
    // }
  };

  return (
    <div className="max-w-7xl mx-auto flex-1 p-8 min-h-screen">
      <div className="mx-auto">
        <SecuritySection onSave={handleSaveSecurity} />
      </div>
    </div>
  );
}
