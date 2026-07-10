import React, { useEffect, useState } from 'react';
import {
  FacebookIcon,
  GithubIcon,
  Globe,
  InstagramIcon,
  Linkedin,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import AddressSection from '@/features/job-seeker/components/profile/components/form/AddressSection.tsx';
import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';
import { TextAreaField } from '@/features/job-seeker/components/profile/components/form/TextAreaField.tsx';
import type { Profile } from '@/features/job-seeker/components/profile/types/profile.types.tsx';
import {
  formatValidationErrors,
  validatePrivateInfo,
  validateSocialLink,
} from '@/features/job-seeker/components/profile/utils/validation.ts';
import AvatarUploader from '@/features/job-seeker/components/upload/AvatarUploader.tsx';

type ProfileFormProps = {
  profile: Profile;
  onUpdate: (updatedProfile: Partial<Profile>) => void;
  isAccountSection?: boolean; // To conditionally render AvatarUploader
};

// Helper function to get icon for social platform
const getSocialIcon = (platform: string) => {
  const platformLower = platform.toLowerCase();
  if (platformLower.includes('github')) return <GithubIcon className="h-5 w-5 text-gray-600" />;
  if (platformLower.includes('linkedin')) return <Linkedin className="h-5 w-5 text-blue-600" />;
  if (platformLower.includes('facebook')) return <FacebookIcon className="h-5 w-5 text-blue-700" />;
  if (platformLower.includes('instagram')) return <InstagramIcon className="h-5 w-5 text-pink-600" />;
  return <Globe className="h-5 w-5 text-gray-600" />;
};

export function ProfileForm({ profile, onUpdate, isAccountSection = false }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    bio: profile.bio || '',
    title: profile.title || '',
    company: profile.company || '',
    expectedSalary: profile.expectedSalary?.toString() || '',
    careerObjective: profile.careerObjective || '',
    avatar: profile.avatar || '',
    socialLinks: profile.socialLinks || [],
  });

  useEffect(() => {
    setFormData({
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      bio: profile.bio || '',
      title: profile.title || '',
      company: profile.company || '',
      expectedSalary: profile.expectedSalary?.toString() || '',
      careerObjective: profile.careerObjective || '',
      avatar: profile.avatar || '',
      socialLinks: profile.socialLinks || [],
    });
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSocialLinkChange = (index: number, platform: string, url: string) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = { ...newSocialLinks[index], platform, url };
    setFormData((prev) => ({ ...prev, socialLinks: newSocialLinks }));
  };

  const handleAddSocialLink = () => {
    const newSocialLink = { platform: 'website', url: '' };
    setFormData((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink],
    }));
    toast.success('New social link added');
  };

  const handleRemoveSocialLink = (index: number) => {
    const newSocialLinks = formData.socialLinks.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, socialLinks: newSocialLinks }));
    toast.success('Social link removed');
  };

  const handleSave = async () => {
    // Validate private information (including location)
    const basicErrors = validatePrivateInfo({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
    });
    if (basicErrors.length > 0) {
      toast.error(formatValidationErrors(basicErrors));
      return;
    }

    // Validate social links
    for (const link of formData.socialLinks) {
      const linkErrors = validateSocialLink(link.platform, link.url);
      if (linkErrors.length > 0) {
        toast.error(`Social link error: ${formatValidationErrors(linkErrors)}`);
        return;
      }
    }

    setIsSaving(true);
    try {
      await onUpdate({
        ...formData,
        expectedSalary: parseFloat(formData.expectedSalary) || undefined,
      });
      toast.success('Information saved successfully!');
    } catch (error) {
      toast.error('Failed to save information');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {isAccountSection && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">Profile Picture</h3>
          <AvatarUploader
            currentAvatarUrl={profile.avatar}
            onUploadSuccess={() => {
              // Invalidation should handle the update
            }}
          />
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField id="name" label="Full Name" value={formData.name} onChange={handleInputChange} />
          <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} disabled={true} />
          <InputField id="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} />
          <div className="md:col-span-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">Location</label>
            <AddressSection
              location={formData.location}
              onLocationChange={(location) => setFormData((prev) => ({ ...prev, location }))}
            />
          </div>
          <div className="md:col-span-2">
            <TextAreaField id="bio" label="Bio" value={formData.bio} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField id="title" label="Job Title" value={formData.title} onChange={handleInputChange} />
          <InputField id="company" label="Company" value={formData.company} onChange={handleInputChange} />
          <InputField id="expectedSalary" label="Expected Salary (USD)" type="text" value={formData.expectedSalary} onChange={handleInputChange} />
          <div className="md:col-span-2">
            <TextAreaField id="careerObjective" label="Career Objective" value={formData.careerObjective} onChange={handleInputChange} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">Social Presence</h3>
          <button type="button" onClick={handleAddSocialLink} className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
            <Plus className="h-4 w-4" />
            Add Link
          </button>
        </div>
        {formData.socialLinks.length > 0 ? (
          <div className="space-y-4">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-background">
                <div className="flex-shrink-0 mt-8">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {getSocialIcon(link.platform)}
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField id={`social-platform-${index}`} label="Platform" value={link.platform} onChange={(e) => handleSocialLinkChange(index, e.target.value, link.url)} />
                  <InputField id={`social-url-${index}`} label="URL" value={link.url} onChange={(e) => handleSocialLinkChange(index, link.platform, e.target.value)} />
                </div>
                <button type="button" onClick={() => handleRemoveSocialLink(index)} className="flex-shrink-0 mt-8 rounded-full p-2 text-red-500 transition-colors hover:bg-red-50" title="Remove social link">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No social links added yet.</p>
            <button type="button" onClick={handleAddSocialLink} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600">
              <Plus className="h-4 w-4" />
              Add Your First Link
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
