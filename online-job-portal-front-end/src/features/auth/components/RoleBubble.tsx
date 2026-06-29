import React from "react";

interface RoleBubbleProps {
  selectedRole: "job_seeker" | "recruiter";
  onRoleChange: (role: "job_seeker" | "recruiter") => void;
}

export const RoleBubble: React.FC<RoleBubbleProps> = ({ selectedRole, onRoleChange }) => {
  const baseButtonClass = "cursor-pointer transition-all duration-300 shadow-lg font-medium rounded-r-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500";

  const getButtonClass = (role: "job_seeker" | "recruiter") => {
    const isSelected = selectedRole === role;
    const baseClasses = isSelected
      ? "bg-white text-orange-500 font-bold"
      : "bg-gray-300 text-gray-500";

    const widthClass = role === "job_seeker"
      ? isSelected ? "w-[45%] lg:w-[40%]" : "w-[35%] lg:w-[25%]"
      : isSelected ? "w-[43%] lg:w-[35%]" : "w-[25%] lg:w-[22%]";

    return `${baseButtonClass} ${baseClasses} ${widthClass}`;
  };

  const getPadding = (role: "job_seeker" | "recruiter") => {
    const isSelected = selectedRole === role;
    return {
      paddingTop: isSelected ? '2rem' : '1.5rem',
      paddingBottom: isSelected ? '2rem' : '1.5rem',
      fontSize: isSelected ? 'clamp(1rem, 2.5vw, 1.75rem)' : 'clamp(0.875rem, 2vw, 1.125rem)',
      lineHeight: '1.2',
      textAlign: 'center' as const,
    };
  };

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-5 z-30 w-full">
      {/* Job Seeker Bubble */}
      <button
        type="button"
        className={getButtonClass("job_seeker")}
        style={getPadding("job_seeker")}
        onClick={() => onRoleChange("job_seeker")}
        aria-label="Select Job Seeker role"
        aria-pressed={selectedRole === "job_seeker"}
      >
        Job Seeker
      </button>

      {/* Recruiter Bubble */}
      <button
        type="button"
        className={getButtonClass("recruiter")}
        style={getPadding("recruiter")}
        onClick={() => onRoleChange("recruiter")}
        aria-label="Select Recruiter role"
        aria-pressed={selectedRole === "recruiter"}
      >
        Recruiter
      </button>
    </div>
  );
};