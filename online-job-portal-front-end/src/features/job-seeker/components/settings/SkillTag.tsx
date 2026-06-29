// src/features/recruiter/components/settings/SkillTag.tsx
import React from 'react';
import { X } from 'lucide-react';
import type { Skill } from '@/features/job-seeker/settings.types.ts';

interface SkillTagProps {
  skill: Skill;
  onDelete: (id: number) => void;
}

export const SkillTag: React.FC<SkillTagProps> = ({ skill, onDelete }) => {
  return (
    <div className="inline-flex items-center gap-2 bg-btn-orange text-default px-4 py-2 rounded-full text-sm font-medium border border-default/20">
      <span>{skill.name}</span>
      {skill.level && <span className="text-xs opacity-75 font-normal">({skill.level})</span>}
      <button
        onClick={() => onDelete(skill.id)}
        className="hover:bg-default/20 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
