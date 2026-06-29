import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Btn';

import { useAppSelector } from '@/hooks/redux';
import { useChangePasswordMutation } from '@/redux/features/auth/authApi';

interface SecuritySectionProps {
  onSave?: () => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onSave }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Get user from Redux store
  const user = useAppSelector((state) => state.auth.user);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword.length > 128) {
      toast.error('New password cannot exceed 128 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    if (!user?.userId) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      if (response.success) {
        toast.success(response.message || 'Password changed successfully!');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Call onSave callback if provided
        onSave?.();
      } else {
        toast.error(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error?.data?.message || 'Failed to change password. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <section>
      <div className="container mx-auto">
        <div className="bg-white rounded-lg p-6 md:p-8 space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="px-6 py-2.5 bg-default text-white rounded-lg hover:bg-default/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Security Settings'}
            </Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2.5 pr-10 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-blur hover:text-gray-700"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2.5 pr-10 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-blur hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2.5 pr-10 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-default focus:border-default transition-all"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-blur hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stroke">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between p-4 bg-section rounded-lg border border-stroke">
              <div>
                <p className="font-medium text-gray-900">Enable 2FA</p>
                <p className="text-sm text-text-blur mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-default/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-default"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
