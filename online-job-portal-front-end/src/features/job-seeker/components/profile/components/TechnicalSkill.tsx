import { useEffect, useState } from 'react';
import { Code, Edit, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import type { SkillCategory } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

// A simple tag input component
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !tags.includes(value)) {
        onChange([...tags, value]);
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-input bg-transparent p-2">
      {tags.map((tag) => (
        <div
          key={tag}
          className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-primary transition-colors hover:text-primary/80"
            aria-label={`Remove ${tag}`}
          >
            &times;
          </button>
        </div>
      ))}
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder="Add a skill and press Enter..."
        className="flex-1 bg-transparent p-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

type TechnicalSkillProps = {
  jobSkills: SkillCategory[];
  onUpdate: (updatedSkills: SkillCategory[]) => void;
  isPublicView?: boolean;
};

function TechnicalSkill({ jobSkills, onUpdate, isPublicView }: TechnicalSkillProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localSkills, setLocalSkills] = useState<SkillCategory[]>(
    Array.isArray(jobSkills) ? jobSkills : [],
  );
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props when they change from outside (but not while editing)
  useEffect(() => {
    if (editingIndex === null) {
      setLocalSkills(Array.isArray(jobSkills) ? jobSkills : []);
    }
  }, [jobSkills, editingIndex]);

  useEffect(() => {
    return () => {
      if (editingIndex !== null) {
        const category = localSkills[editingIndex];
        // Check if it's a new, unmodified entry
        if (category && category.categoryName === '' && category.skills.length === 0) {
          const newSkills = localSkills.filter((_, i) => i !== editingIndex);
          setLocalSkills(newSkills);
        }
      }
    };
  }, [editingIndex]);

  const handleAdd = () => {
    const newCategory: SkillCategory = {
      categoryName: '',
      skills: [],
    };
    setLocalSkills((prev) => [newCategory, ...prev]);
    setEditingIndex(0); // Automatically switch to edit mode for the new category
  };

  const handleRemove = (index: number) => {
    toast.warning('Are you sure you want to delete this entire category?', {
      action: {
        label: 'Delete',
        onClick: () => {
          const newSkills = localSkills.filter((_, i) => i !== index);
          setLocalSkills(newSkills);
          onUpdate(newSkills); // Save to backend immediately when removing
          if (editingIndex === index) setEditingIndex(null);
          toast.success('Category removed');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleChange = (index: number, field: keyof SkillCategory, value: string | string[]) => {
    setLocalSkills((prev) => {
      const newSkills = [...prev];
      newSkills[index] = { ...newSkills[index], [field]: value };
      return newSkills;
    });
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const category = localSkills[editingIndex];
      if (!category.categoryName.trim()) {
        toast.error('Category name cannot be empty');
        return;
      }
    }
    // Save to backend when user clicks Save
    setIsSaving(true);
    try {
      await onUpdate(localSkills);
      setEditingIndex(null);
      toast.success('Skills saved successfully');
    } catch (error) {
      toast.error('Failed to save skills');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const category = localSkills[editingIndex];
      // Check if it's a new, unmodified entry
      if (category.categoryName === '' && category.skills.length === 0) {
        const newSkills = localSkills.filter((_, i) => i !== editingIndex);
        setLocalSkills(newSkills);
      } else {
        // Revert to original data from props
        setLocalSkills(Array.isArray(jobSkills) ? jobSkills : []);
      }
    }
    setEditingIndex(null);
  };

  return (
    <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Code className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Job Skills</h2>
            <p className="text-sm text-muted-foreground">Organize your skills by category</p>
          </div>
        </div>
        {!isPublicView && (
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Add New Category
        </button>
        )}
      </div>

      {/* Skill Categories */}
      <div className="space-y-4">
        {localSkills.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <Code className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">No Skill Categories</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&#39;t added any skill categories yet.
            </p>
            {!isPublicView && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </button>
            )}
          </div>
        ) : (
          localSkills.map((category, index) => (
            <div key={category._id || index}>
              {editingIndex === index ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor={`categoryName-${index}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Category Name
                      </label>
                      <input
                        id={`categoryName-${index}`}
                        autoFocus
                        type="text"
                        value={category.categoryName}
                        onChange={(e) => handleChange(index, 'categoryName', e.target.value)}
                        placeholder="e.g., Frontend, Backend, DevOps..."
                        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`skills-${index}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Skills
                      </label>
                      <div className="mt-1">
                        <TagInput
                          tags={category.skills || []}
                          onChange={(newSkills) => handleChange(index, 'skills', newSkills)}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Press Enter or comma to add a skill
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
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
                <div className="group rounded-lg border border-border bg-background shadow-sm transition-all hover:shadow-md">
                  {/* View Mode: Category Header */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {category.categoryName || 'Untitled Category'}
                    </h3>

                    {!isPublicView && (
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-muted/20 hover:text-primary group-hover:opacity-100"
                      aria-label={`Edit category: ${category.categoryName}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    )}
                  </div>

                  {/* View Mode: Category Body */}
                  <div className="p-4">
                    {category.skills && category.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default TechnicalSkill;
