// src/features/recruiter/components/settings/WorkExperienceCard.tsx
import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import type { WorkExperience } from '@/features/job-seeker/settings.types.ts';

interface WorkExperienceCardProps {
  experience: WorkExperience;
  onDelete: (id: number) => void;
  onEdit: (experience: WorkExperience) => void;
}

export const WorkExperienceCard: React.FC<WorkExperienceCardProps> = ({
  experience,
  onDelete,
  onEdit,
}) => {
  return (
    <div className="bg-white border border-stroke rounded-lg p-5 mb-3 hover:shadow-md hover:border-default/30 transition-all">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{experience.position}</h4>
          <p className="text-sm text-text-blur font-medium mt-1">{experience.company}</p>
          <p className="text-xs text-text-blur mt-2">
            {experience.startDate} - {experience.endDate || 'Present'}
          </p>
          {experience.description && (
            <p className="text-sm text-gray-700 mt-3 leading-relaxed">{experience.description}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(experience)}
            className="p-2 text-default hover:bg-btn-orange rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(experience.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
