import { useEffect, useState } from 'react';
import { Briefcase, Check, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';
import { TextAreaField } from '@/features/job-seeker/components/profile/components/form/TextAreaField.tsx';
import { WorkExperienceCard } from '@/features/job-seeker/components/profile/components/work-experience/WorkExperienceCard.tsx';
import type { WorkExperience } from '@/features/job-seeker/components/profile/types/profile.types.tsx';
import {
  validateWorkExperience,
  formatValidationErrors,
} from '@/features/job-seeker/components/profile/utils/validation';
import { toDateInputValue } from '@/features/job-seeker/components/profile/utils/dateUtils';

type WorkExperienceSectionProps = {
  workExperiences: WorkExperience[];
  onUpdate: (updatedExperiences: WorkExperience[]) => void;
  isPublicView?: boolean;
};
export default function WorkExperienceSection({
  workExperiences,
  onUpdate,
  isPublicView,
}: WorkExperienceSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localExperiences, setLocalExperiences] = useState<WorkExperience[]>(workExperiences);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props when they change from outside (but not while editing)
  useEffect(() => {
    if (editingIndex === null) {
      setLocalExperiences(workExperiences);
    }
  }, [workExperiences, editingIndex]);

  useEffect(() => {
    return () => {
      if (editingIndex !== null) {
        const experience = localExperiences[editingIndex];
        // Check if it's a new, unmodified entry
        if (
          experience &&
          experience.title === '' &&
          experience.company === '' &&
          (!experience.description || experience.description === '')
        ) {
          const newExperiences = localExperiences.filter((_, i) => i !== editingIndex);
          setLocalExperiences(newExperiences);
        }
      }
    };
  }, [editingIndex]);

  const handleAdd = () => {
    const newExperience: WorkExperience = {
      title: '',
      company: '',
      startDate: '',
      endDate: null,
      isCurrent: false,
      description: '',
    };
    setLocalExperiences((prev) => [newExperience, ...prev]);
    setEditingIndex(0); // Automatically switch to edit mode for the new experience
  };

  const handleRemove = (index: number) => {
    toast.warning('Are you sure you want to remove this work experience?', {
      action: {
        label: 'Remove',
        onClick: () => {
          const newExperiences = localExperiences.filter((_, i) => i !== index);
          setLocalExperiences(newExperiences);
          onUpdate(newExperiences); // Save to backend immediately when removing
          if (editingIndex === index) setEditingIndex(null); // If the removed experience was being edited, exit edit mode
          toast.success('Work experience removed');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleChange = (index: number, field: keyof WorkExperience, value: string | boolean | null) => {
    setLocalExperiences((prev) => {
      const newExperiences = [...prev];
      newExperiences[index] = { ...newExperiences[index], [field]: value };
      return newExperiences;
    });
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const experience = localExperiences[editingIndex];
      const errors = validateWorkExperience(experience);

      if (errors.length > 0) {
        toast.error(formatValidationErrors(errors));
        return;
      }
    }

    // Save to backend when user clicks Save
    setIsSaving(true);
    try {
      await onUpdate(localExperiences);
      setEditingIndex(null);
      toast.success('Work experience saved successfully');
    } catch (error) {
      toast.error('Failed to save work experience');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const experience = localExperiences[editingIndex];
      // Check if it's a new, unmodified entry
      if (
        experience.title === '' &&
        experience.company === '' &&
        (!experience.description || experience.description === '')
      ) {
        const newExperiences = localExperiences.filter((_, i) => i !== editingIndex);
        setLocalExperiences(newExperiences);
      } else {
        // Revert to original data from props
        setLocalExperiences(workExperiences);
      }
    }
    setEditingIndex(null);
  };

  return (
    <section className="w-full  p-6 bg-card rounded-lg shadow-md border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Work Experience</h2>
            <p className="text-sm text-muted-foreground">
              {/* eslint-disable-next-line no-negated-condition */}
              {localExperiences.length} position{localExperiences.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {!isPublicView && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
        )}
      </div>

      <div className="space-y-4">
        {localExperiences.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">No Work Experience</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&#39;t added any work experience yet.
            </p>
            {!isPublicView && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Add Work Experience
            </button>
            )}
          </div>
        ) : (
          localExperiences.map((exp, index) => (
            <div key={exp._id || `exp-${index}`}>
              {editingIndex === index ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <InputField
                        id={`title-${index}`}
                        label="Job Title"
                        placeholder="e.g., Senior Developer"
                        value={exp.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                      />
                      <InputField
                        id={`company-${index}`}
                        label="Company"
                        placeholder="e.g., Tech Company Inc."
                        value={exp.company}
                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                      />
                      <InputField
                        id={`startDate-${index}`}
                        label="Start Date"
                        type="date"
                        value={toDateInputValue(exp.startDate)}
                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <InputField
                            id={`endDate-${index}`}
                            label="End Date"
                            type="date"
                            value={toDateInputValue(exp.endDate)}
                            onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                            disabled={exp.isCurrent}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
                      <input
                        type="checkbox"
                        id={`isCurrent-${index}`}
                        checked={exp.isCurrent}
                        onChange={(e) => {
                          handleChange(index, 'isCurrent', e.target.checked);
                          // Clear endDate when marking as current
                          if (e.target.checked) {
                            handleChange(index, 'endDate', null);
                          }
                        }}
                        className="h-4 w-4 cursor-pointer rounded border-border"
                      />
                      <label
                        htmlFor={`isCurrent-${index}`}
                        className="cursor-pointer text-sm font-medium text-foreground"
                      >
                        I currently work here
                      </label>
                    </div>

                    <TextAreaField
                      id={`description-${index}`}
                      label="Description"
                      placeholder="Describe your responsibilities and achievements..."
                      value={exp.description || ''}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                      rows={4}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <WorkExperienceCard experience={exp} onEdit={!isPublicView ? () => setEditingIndex(index) : undefined} />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
