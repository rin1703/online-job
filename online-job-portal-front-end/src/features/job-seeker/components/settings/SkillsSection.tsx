// src/features/recruiter/components/settings/SkillsSection.tsx
import React from 'react';
import { Plus, Award } from 'lucide-react';
import { SkillTag } from './SkillTag.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import type { Skill } from '@/features/job-seeker/settings.types.ts';

interface SkillsSectionProps {
  skills: Skill[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onAdd, onDelete }) => {
  return (
    <section>
      <div className=" container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-primary">Skills</h1>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-default text-white rounded-lg hover:bg-default/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Skill
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-stroke p-6">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <SkillTag key={skill.id} skill={skill} onDelete={onDelete} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Award} message="No skills added yet" />
          )}
        </div>
      </div>
    </section>
  );
};
