import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { ProfileForm } from "@/features/job-seeker/components/profile/components/sections/ProfileForm.tsx";
import CVSection from "@/features/job-seeker/components/profile/components/cv-section/CVSection.tsx";
import EducationSection from "@/features/job-seeker/components/profile/components/education/Education.tsx";
import { NavigationTab } from "@/features/job-seeker/components/profile/components/NavigationTab.tsx";
import ProjectsSection from "@/features/job-seeker/components/profile/components/projects/Projects.tsx";
import TechnicalSkill from "@/features/job-seeker/components/profile/components/TechnicalSkill.tsx";
import WorkExperienceSection from "@/features/job-seeker/components/profile/components/work-experience/WorkExperienceSection.tsx";
import CertificatesSection from "@/features/job-seeker/components/profile/components/certificates/Certificates.tsx";
import ProfileHeader from "./ProfileHeader.tsx";

import type {
  Profile,
  SkillCategory,
} from "@/features/job-seeker/components/profile/types/profile.types.tsx";

type Section = "work" | "skills" | "projects" | "education" | "certificates" | "cv" | "settings";

type ProfileContentProps = {
  profile: Profile;
  onUpdate: (updatedData: Partial<Profile>) => void;
};

function ProfileContent({ profile, onUpdate }: ProfileContentProps) {
  const [searchParams] = useSearchParams();

  // Khởi tạo với "work" là mặc định
  const [activeSection, setActiveSection] = useState<Section>(() => {
    const sectionFromUrl = searchParams.get("section") as Section;
    return sectionFromUrl || "work";
  });

  // Cập nhật khi URL thay đổi
  useEffect(() => {
    const sectionFromUrl = searchParams.get("section") as Section;
    if (sectionFromUrl) {
      setActiveSection(sectionFromUrl);
    }
  }, [searchParams]);

  const renderSection = () => {
    switch (activeSection) {
      case "work":
        return (
          <WorkExperienceSection
            workExperiences={profile.workExperiences || []}
            onUpdate={(workExperiences) => onUpdate({ workExperiences })}
            isPublicView={true}
          />
        );
      case "skills":
        return (
          <TechnicalSkill
            jobSkills={profile.jobSkills || []}
            onUpdate={(categories: SkillCategory[]) => onUpdate({ jobSkills: categories })}
            isPublicView={true}
          />
        );
      case "projects":
        return (
          <ProjectsSection
            projects={profile.projects || []}
            onUpdate={(projects) => onUpdate({ projects })}
            isPublicView={true}
          />
        );
      case "education":
        return (
          <EducationSection
            education={profile.education || []}
            onUpdate={(education) => onUpdate({ education })}
            isPublicView={true}
          />
        );
      case "certificates":
        return (
          <CertificatesSection
            certificates={profile.certificates || []}
            onUpdate={(certificates) => onUpdate({ certificates })}
            isPublicView={true}
          />
        );
      case "cv":
        return (
          <CVSection
            cvUrl={profile.cvUrl}
            onUpdate={(cvUrl) => onUpdate({ cvUrl })}
            isPublicView={true}
          />
        );
      case "settings":
        return <ProfileForm profile={profile} onUpdate={onUpdate} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full rounded-2xl bg-white p-6 shadow-lg h-[calc(100vh-15rem)] overflow-auto">
      <ProfileHeader />
      <NavigationTab activeSection={activeSection} onSectionChange={setActiveSection} />

      <div className="mt-4 w-full flex-1 overflow-y-auto px-2 scrollbar-hide scrollbar-hide::-webkit-scrollbar">
        <div
          key={activeSection}
          className="w-full transition-all duration-300 animate-fadeInUp animate-duration-fast"
        >
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

export default ProfileContent;
