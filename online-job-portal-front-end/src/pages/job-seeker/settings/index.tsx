import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getErrorMessage } from "@/features/job-seeker/components/profile/utils/errorHandler";
import EducationSection from "@/features/job-seeker/components/profile/components/education/Education";
import ProjectsSection from "@/features/job-seeker/components/profile/components/projects/Projects";
import TechnicalSkill from "@/features/job-seeker/components/profile/components/TechnicalSkill";
import WorkExperienceSection from "@/features/job-seeker/components/profile/components/work-experience/WorkExperienceSection";
import CertificatesSection from "@/features/job-seeker/components/profile/components/certificates/Certificates";
import { AccountSection } from "@/features/job-seeker/components/profile/components/sections/AccountSection";
import CVSection from "@/features/job-seeker/components/profile/components/sections/CVSection";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/redux/features/profile";
import type { RootState } from "@/redux/store";

export default function JobSeekerSettingsPage() {
  const location = useLocation();
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
  // Handle scroll to section when hash changes
  useEffect(() => {
    if (location.hash) {
      // Remove the '#' from the hash
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        // Wait for the component to render
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location.hash]);

  const getProfileData = () => {
    if (profile) {
      // Ensure all array fields are defined (never undefined)
      return {
        ...profile,
        socialLinks: profile.socialLinks || [],
        jobSkills: profile.jobSkills || [],
        workExperiences: profile.workExperiences || [],
        education: profile.education || [],
        projects: profile.projects || [],
        certificates: profile.certificates || [],
        // Ensure string fields are never undefined
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

    // Return default empty profile when no data exists
    return {
      _id: "",
      user: userId || "",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const profileData = getProfileData();

  return (
    <div id="settings-content" className="w-full h-full p-8 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8 pb-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and profile information</p>
        </div>

        {/* Account Section */}
        <AccountSection profile={profileData as any} onUpdate={handleUpdateProfile} />

        {/* CV Section */}
        <div id="cv" className="scroll-mt-24">
          <CVSection
            currentCVUrl={profileData.cvUrl || profileData.cv}
            currentCVName={
              profileData.cvUrl || profileData.cv
                ? (profileData.cvUrl || profileData.cv)?.split("/").pop() || "resume.pdf"
                : undefined
            }
          />
        </div>

        {/* Work Experience Section */}
        <div id="work-experience" className="scroll-mt-24">
          <WorkExperienceSection
            workExperiences={profileData.workExperiences}
            onUpdate={(updatedExperiences) =>
              handleUpdateProfile({ workExperiences: updatedExperiences })
            }
          />
        </div>

        {/* Education Section */}
        <div id="education" className="scroll-mt-24">
          <EducationSection
            education={profileData.education}
            onUpdate={(updatedEducation) => handleUpdateProfile({ education: updatedEducation })}
          />
        </div>

        {/* Projects Section */}
        <div id="projects" className="scroll-mt-24">
          <ProjectsSection
            projects={profileData.projects}
            onUpdate={(updatedProjects) => handleUpdateProfile({ projects: updatedProjects })}
          />
        </div>

        {/* Skills Section */}
        <div id="skills" className="scroll-mt-24">
          <TechnicalSkill
            jobSkills={profileData.jobSkills}
            onUpdate={(updatedSkills) => handleUpdateProfile({ jobSkills: updatedSkills })}
          />
        </div>

        {/* Certificates Section */}
        <div id="certificates" className="scroll-mt-24">
          <CertificatesSection
            certificates={profileData.certificates}
            onUpdate={(updatedCertificates) =>
              handleUpdateProfile({ certificates: updatedCertificates })
            }
          />
        </div>

        {/* Security Section - Change Password */}
        {/*<div id="security" className="scroll-mt-24">*/}
        {/*  <SecuritySection />*/}
        {/*</div>*/}
      </div>
    </div>
  );
}
