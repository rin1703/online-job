import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserProfile } from "../types/profile.types";

interface ProfileCompletenessIndicatorProps {
  profile: UserProfile | null;
}

/**
 * Calculate profile completeness percentage
 * Checks presence of important profile fields
 */
function calculateCompleteness(profile: UserProfile | null): {
  percentage: number;
  completed: number;
  total: number;
  missingFields: string[];
} {
  if (!profile) {
    return { percentage: 0, completed: 0, total: 14, missingFields: [] };
  }

  const fields = [
    { key: "avatar", label: "Profile Picture", value: profile.avatar },
    { key: "title", label: "Job Title", value: profile.title },
    { key: "bio", label: "Biography", value: profile.bio },
    { key: "location", label: "Location", value: profile.location },
    { key: "email", label: "Email", value: profile.email },
    { key: "phone", label: "Phone", value: profile.phone },
    { key: "expectedSalary", label: "Expected Salary", value: profile.expectedSalary },
    { key: "careerObjective", label: "Career Objective", value: profile.careerObjective },
    { key: "socialLinks", label: "Social Links", value: profile.socialLinks?.length },
    { key: "experiences", label: "Work Experience", value: profile.workExperiences?.length },
    { key: "education", label: "Education", value: profile.education?.length },
    { key: "projects", label: "Projects", value: profile.projects?.length },
    { key: "certificates", label: "Certificates", value: profile.certificates?.length },
    { key: "jobSkills", label: "Skills", value: profile.jobSkills?.length },
  ];

  const completed = fields.filter((field) => {
    if (typeof field.value === "number") return field.value > 0;
    return !!field.value;
  }).length;

  const missingFields = fields
    .filter((field) => {
      if (typeof field.value === "number") return field.value === 0 || !field.value;
      return !field.value;
    })
    .map((field) => field.label);

  const total = fields.length;
  const percentage = Math.round((completed / total) * 100);

  return { percentage, completed, total, missingFields };
}

export function ProfileCompletenessIndicator({ profile }: ProfileCompletenessIndicatorProps) {
  const { percentage, completed, total, missingFields } = calculateCompleteness(profile);

  // Color based on completeness
  const getColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-600";
    if (percentage >= 50) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {percentage >= 80 ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              Profile Completeness
            </h3>
            <span className={`text-2xl font-bold ${getColor()}`}>{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress value={percentage} className="h-2" indicatorClassName={getProgressColor()} />
            <p className="text-xs text-gray-600">
              {completed} of {total} sections completed
            </p>
          </div>

          {/* Message based on completeness */}
          {percentage >= 80 ? (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
              Great job! Your profile is almost complete.
            </p>
          ) : percentage >= 50 ? (
            <p className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
              You're halfway there! Complete your profile to improve your visibility.
            </p>
          ) : (
            <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
              Your profile needs attention. Complete more sections to stand out.
            </p>
          )}

          {/* Missing fields (show up to 3) */}
          {missingFields.length > 0 && percentage < 100 && (
            <div className="pt-2 border-t border-blue-200">
              <p className="text-xs font-medium text-gray-700 mb-1">Missing sections:</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {missingFields.slice(0, 3).map((field) => (
                  <li key={field} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    {field}
                  </li>
                ))}
                {missingFields.length > 3 && (
                  <li className="text-gray-500 italic">+{missingFields.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
