// src/features/recruiter/components/settings/WorkExperienceSection.tsx
import React from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { FilterBar } from '@/components/ui/FilterBar.tsx';
import { WorkExperienceCard } from './WorkExperienceCard.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import type { WorkExperience } from '@/features/job-seeker/settings.types.ts';

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onEdit: (experience: WorkExperience) => void;
}

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'current', label: 'Current Position' },
  { value: 'past', label: 'Past Positions' },
];

export const WorkExperienceSection: React.FC<WorkExperienceSectionProps> = ({
  experiences,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  onAdd,
  onDelete,
  onEdit,
}) => {
  const filteredExperiences = experiences.filter((exp) => {
    const matchesSearch =
      exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'current' && !exp.endDate) ||
      (selectedFilter === 'past' && exp.endDate);
    return matchesSearch && matchesFilter;
  });

  return (
    <section>
      {' '}
      <div className=" container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-primary">Work Experience</h1>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-default text-white rounded-lg hover:bg-default/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Experience
          </button>
        </div>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          filterOptions={filterOptions}
          onFilterChange={onFilterChange}
          selectedFilter={selectedFilter}
          placeholder="Search by position or company..."
        />

        <div className="space-y-3">
          {filteredExperiences.length > 0 ? (
            filteredExperiences.map((exp) => (
              <WorkExperienceCard
                key={exp.id}
                experience={exp}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))
          ) : (
            <EmptyState icon={Briefcase} message="No work experience found" />
          )}
        </div>
      </div>
    </section>
  );
};
