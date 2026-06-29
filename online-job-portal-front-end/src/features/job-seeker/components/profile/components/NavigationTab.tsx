import React, { useState } from "react";
import { Award, BookOpen, Briefcase, Code, FileText, GitMerge } from "lucide-react";

interface TabButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon: Icon, label, isActive, onClick }: Readonly<TabButtonProps>) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 font-medium transition-all duration-300 sm:px-3 md:px-4 ${
        isActive ? "bg-white text-orange-500 shadow-sm" : "text-white hover:bg-white/10"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
      {(isActive || isHovered) && (
        <span className="hidden whitespace-nowrap md:inline">{label}</span>
      )}
    </button>
  );
}

export function NavigationTab({
  activeSection,
  onSectionChange,
}: Readonly<{
  activeSection: string;
  onSectionChange: (section: any) => void;
}>) {
  const tabs = [
    { id: "work", label: "Work", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Code },
    { id: "projects", label: "Projects", icon: GitMerge },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "cv", label: "CV", icon: FileText },
  ];

  return (
    <div className="w-full overflow-hidden">
      <div className="flex w-full items-center gap-0.5 rounded-xl bg-orange-500 p-1.5 sm:gap-1 sm:p-2 md:gap-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            isActive={activeSection === tab.id}
            onClick={() => onSectionChange(tab.id)}
          />
        ))}
      </div>
    </div>
  );
}
