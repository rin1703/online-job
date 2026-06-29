import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import ProfileContent from "@/features/job-seeker/components/profile/components/ProfileContent.tsx";
import { ProfileSidebar } from "@/features/job-seeker/components/profile/components/ProfileSidebar.tsx";
import { getErrorMessage } from "@/features/job-seeker/components/profile/utils/errorHandler";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/features/profile";
import type { RootState } from "@/redux/store";

export default function ProfilePage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  // Get userId and role from auth state
  const userId = useSelector((state: RootState) => state.auth.user?.userId);
  const userName = useSelector((state: RootState) => {
    const user = state.auth.user;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email?.split("@")[0] || "User";
  });

  // Fetch profile from API (no userId needed - from JWT token)
  const { data: profile, isLoading } = useGetProfileQuery();

  // Update profile mutation
  const [updateProfile] = useUpdateProfileMutation();

  // Handle profile update
  const handleUpdateProfile = async (updatedData: any) => {
    try {
      await updateProfile(updatedData).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      const errorMessage = getErrorMessage(error, "Failed to update profile");
      toast.error(errorMessage);
      console.error("Update profile error:", error);
    }
  };

  // Create default empty profile for new users
  const getProfileData = () => {
    if (profile) {
      return {
        ...profile,
        socialLinks: profile.socialLinks || [],
        jobSkills: profile.jobSkills || [],
        workExperiences: profile.workExperiences || [],
        education: profile.education || [],
        projects: profile.projects || [],
        certificates: profile.certificates || [],
        name: profile.name || userName || "",
        avatar: profile.avatar || "",
        title: profile.title || "",
        company: profile.company || "",
        bio: profile.bio || "",
        location: profile.location || "",
        email: profile.email || "",
        phone: profile.phone || "",
        careerObjective: profile.careerObjective || "",
        cv: profile.cv || "",
        cvUrl: profile.cvUrl || profile.cv || "",
        expectedSalary: profile.expectedSalary || 0,
      };
    }
    return {
      _id: "",
      user: {
        _id: userId || "",
        role: "job_seeker" as const,
        email: "",
      },
      name: userName || "",
      avatar: "",
      title: "",
      company: "",
      bio: "",
      location: "",
      email: "",
      phone: "",
      expectedSalary: 0,
      careerObjective: "",
      cv: "",
      cvUrl: "",
      socialLinks: [],
      jobSkills: [],
      workExperiences: [],
      education: [],
      projects: [],
      certificates: [],
    };
  };

  const profileData = getProfileData();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fixed background */}
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-[#F97A00] from-40% to-white to-40%"
      />

      {isLoading ? (
        <div className="relative mx-auto max-w-7xl w-full h-screen flex items-center justify-center">
          <div className="space-y-4 w-full max-w-2xl p-10">
            <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : userId ? (
        <main className="relative mx-auto max-w-7xl h-full pt-4 pb-20 px-4 lg:px-0 ">
          <div className="pt-32 flex flex-col lg:flex-row space-x-10 justify-around w-full">
            <div className="animate-slideInLeft animate-duration-slow lg:w-1/4 w-full">
              <ProfileSidebar profile={profileData} />
            </div>
            <div className="w-full lg:w-8/10 animate-slideInRight animate-duration-slow mt-10 lg:mt-0">
              <ProfileContent
                profile={{
                  ...profileData,
                  cvUrl: profileData.cv || profileData.cvUrl,
                }}
                onUpdate={handleUpdateProfile}
              />
            </div>
          </div>
        </main>
      ) : (
        <div className="relative mx-auto max-w-7xl w-full h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to login to view your profile</p>
            <a href="/auth/sign-in" className="text-primary underline">
              Go to Login
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
