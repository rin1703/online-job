import { useEffect, useState } from 'react';
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { EducationCard } from '@/features/job-seeker/components/profile/components/education/EducationCard.tsx';
import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';
import { TextAreaField } from '@/features/job-seeker/components/profile/components/form/TextAreaField.tsx';
import type { Education } from '@/features/job-seeker/components/profile/types/profile.types.tsx';
import {
  validateEducation,
  formatValidationErrors,
} from '@/features/job-seeker/components/profile/utils/validation';
import { toDateInputValue } from '@/features/job-seeker/components/profile/utils/dateUtils';

type EducationSectionProps = {
  education: Education[];
  onUpdate: (updatedEducation: Education[]) => void;
  isPublicView?: boolean;
};

function EducationSection({ education, onUpdate, isPublicView }: EducationSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localEducation, setLocalEducation] = useState<Education[]>(education);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props when they change from outside (but not while editing)
  useEffect(() => {
    if (editingIndex === null) {
      setLocalEducation(education);
    }
  }, [education, editingIndex]);

  useEffect(() => {
    return () => {
      if (editingIndex !== null) {
        const edu = localEducation[editingIndex];
        // Check if it's a new, unmodified entry
        if (
          edu &&
          edu.school === '' &&
          edu.degree === '' &&
          (!edu.description || edu.description === '')
        ) {
          const newEducation = localEducation.filter((_, i) => i !== editingIndex);
          setLocalEducation(newEducation);
        }
      }
    };
  }, [editingIndex]);

  const handleAdd = () => {
    const newEducation: Education = {
      school: '',
      degree: '',
      startDate: '',
      endDate: undefined,
      description: '',
    };
    setLocalEducation((prev) => [newEducation, ...prev]);
    setEditingIndex(0); // Automatically switch to edit mode for the new education entry
  };

  const handleRemove = (index: number) => {
    toast.warning('Are you sure you want to remove this education entry?', {
      action: {
        label: 'Remove',
        onClick: () => {
          const newEducation = localEducation.filter((_, i) => i !== index);
          setLocalEducation(newEducation);
          onUpdate(newEducation); // Save to backend immediately when removing
          if (editingIndex === index) setEditingIndex(null); // If the removed entry was being edited, exit edit mode
          toast.success('Education entry removed');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleChange = (index: number, field: keyof Education, value: string) => {
    setLocalEducation((prev) => {
      const newEducation = [...prev];
      newEducation[index] = { ...newEducation[index], [field]: value };
      return newEducation;
    });
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const edu = localEducation[editingIndex];
      const errors = validateEducation(edu);

      if (errors.length > 0) {
        toast.error(formatValidationErrors(errors));
        return;
      }
    }

    // Save to backend when user clicks Save
    setIsSaving(true);
    try {
      await onUpdate(localEducation);
      setEditingIndex(null);
      toast.success('Education saved successfully');
    } catch (error) {
      toast.error('Failed to save education');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const edu = localEducation[editingIndex];
      // Check if it's a new, unmodified entry
      if (
        edu.school === '' &&
        edu.degree === '' &&
        (!edu.description || edu.description === '')
      ) {
        const newEducation = localEducation.filter((_, i) => i !== editingIndex);
        setLocalEducation(newEducation);
      } else {
        // Revert to original data from props
        setLocalEducation(education);
      }
    }
    setEditingIndex(null);
  };

  return (
    <section className="w-full  p-6 bg-card rounded-lg shadow-md border border-border">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Education</h2>
            <p className="text-sm text-muted-foreground">
              {localEducation.length} institution{localEducation.length === 1 ? '' : 's'}
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
        {localEducation.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">No Education</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven't added any education yet.
            </p>
            {!isPublicView && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Add Education
            </button>
            )}
          </div>
        ) : (
          localEducation.map((edu, index) => (
            <div key={edu._id || `edu-${index}`}>
              {editingIndex === index ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      id={`school-${index}`}
                      label="School"
                      value={edu.school}
                      onChange={(e) => handleChange(index, 'school', e.target.value)}
                    />
                    <InputField
                      id={`degree-${index}`}
                      label="Degree"
                      value={edu.degree}
                      onChange={(e) => handleChange(index, 'degree', e.target.value)}
                    />
                    <InputField
                      id={`startDate-${index}`}
                      label="Start Date"
                      type="date"
                      value={toDateInputValue(edu.startDate)}
                      onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                    />
                    <InputField
                      id={`endDate-${index}`}
                      label="End Date"
                      type="date"
                      value={toDateInputValue(edu.endDate)}
                      onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <TextAreaField
                        id={`description-${index}`}
                        label="Description"
                        value={edu.description || ''}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
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
              ) : (
                <EducationCard education={edu} onEdit={!isPublicView ? () => setEditingIndex(index) : undefined} />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default EducationSection;
