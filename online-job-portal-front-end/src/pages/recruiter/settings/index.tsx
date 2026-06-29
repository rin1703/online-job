import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSection } from '@/features/recruiter/components/settings/AccountSection';
import { SecuritySection } from '@/features/recruiter/components/settings/SecuritySection';
import type { CompanyProfileData } from '@/features/recruiter/settings.types';

export default function SettingsPage() {
  // TODO: Lấy activeTab từ URL hash nếu muốn, ví dụ: location.hash.replace('#', '')
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');

  // Mock data cho trang Account
  const [profileData, setProfileData] = useState<CompanyProfileData>({
    companyName: 'Tech Company A',
    recruiterEmail: 'nguyenvana@company.com',
    companyPhone: '+84 123 456 789',
    companyLocation: 'Da Nang, Vietnam',
    companyWebsite: 'https://techcompanya.com',
    companyBio: 'Leading the charge in tech innovation.',
  });

  const handleSaveProfile = () => {
    console.log('Save profile:', profileData);
    // API call để lưu profile
  };

  const handleSaveSecurity = () => {
    console.log('Save security settings');
    // API call để lưu cài đặt bảo mật
  };

  return (
    // Phần div w-full bg-section này dùng để tạo nền màu kem (giống ảnh)
    <div className="w-full bg-gradient-to-b from-default to-white from-40% to-0% min-h-screen py-32">
      <div className="container mx-auto max-w-5xl">
        {/* Thẻ Card trắng chứa nội dung */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-2 border border-stroke">
          {/* Component Tabs (dùng code tabs.tsx tôi đã gửi) */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            defaultValue="account"
            className=" flex gap-4 justify-center items-center"
          >
            <div>
              <h1 className="text-2xl font-bold mb-6">Setting page</h1>
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger
                  value="security"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/auth/forgot');
                  }}
                >
                  Change Password
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Nội dung Tab Account */}
            <TabsContent value="account">
              <AccountSection
                profileData={profileData}
                onProfileDataChange={setProfileData}
                onSave={handleSaveProfile}
              />
            </TabsContent>

            {/* Nội dung Tab Security */}
            <TabsContent value="security">
              <SecuritySection onSave={handleSaveSecurity} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
