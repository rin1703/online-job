import React from 'react';
import type { CompanyProfileData } from '@/features/recruiter/settings.types';
import { Button } from '@/components/ui/Btn';

interface AccountSectionProps {
  profileData: CompanyProfileData;
  onProfileDataChange: (data: CompanyProfileData) => void;
  onSave: () => void;
}

export const AccountSection: React.FC<AccountSectionProps> = ({
  profileData,
  onProfileDataChange,
  onSave,
}) => {
  const handleChange = (field: keyof CompanyProfileData, value: string) => {
    onProfileDataChange({
      ...profileData,
      [field]: value,
    });
  };

  return (
    <section>
      <div className="container mx-auto">
        <div className="bg-white rounded-lg p-4 md:p-4 space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={onSave}
              className="self-end px-6 py-2.5 bg-default text-white rounded-lg hover:bg-default/90 transition-colors font-medium"
            >
              Save Changes
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                value={profileData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recruiter Email (Login)
              </label>
              <input
                type="email"
                value={profileData.recruiterEmail}
                disabled
                className="w-full px-4 py-2.5 border border-stroke rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
              <input
                type="tel"
                value={profileData.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Location
              </label>
              <input
                type="text"
                value={profileData.companyLocation}
                onChange={(e) => handleChange('companyLocation', e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website
              </label>
              <input
                type="text"
                value={profileData.companyWebsite}
                onChange={(e) => handleChange('companyWebsite', e.target.value)}
                className="w-full px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Bio</label>
            <textarea
              value={profileData.companyBio}
              onChange={(e) => handleChange('companyBio', e.target.value)}
              rows={5}
              className="w-full px-4 py-2.5 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all resize-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
