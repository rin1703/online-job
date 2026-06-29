import { useEffect, useState } from 'react';
import { FolderOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { InputField } from '@/features/job-seeker/components/profile/components/form/InputField.tsx';
import { TextAreaField } from '@/features/job-seeker/components/profile/components/form/TextAreaField.tsx';
import { ProjectCard } from '@/features/job-seeker/components/profile/components/projects/ProjectCard.tsx';
import type { Project } from '@/features/job-seeker/components/profile/types/profile.types.tsx';
import {
  formatValidationErrors,
  validateProject,
} from '@/features/job-seeker/components/profile/utils/validation';

// A simple tag input component
function TagInput({
  id,
  tags,
  onChange,
}: {
  id?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
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
    <div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-primary hover:text-primary/80"
            >
              &times;
            </button>
          </div>
        ))}
        <input
          id={id}
          type="text"
          onKeyDown={handleKeyDown}
          placeholder="Add a tag..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

type ProjectsSectionProps = {
  projects: Project[];
  onUpdate: (updatedProjects: Project[]) => void;
  isPublicView?: boolean;
};

function ProjectsSection({ projects, onUpdate, isPublicView }: ProjectsSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with props when they change from outside (but not while editing)
  useEffect(() => {
    if (editingIndex === null) {
      setLocalProjects(projects);
    }
  }, [projects, editingIndex]);

  useEffect(() => {
    return () => {
      if (editingIndex !== null) {
        const project = localProjects[editingIndex];
        // Check if it's a new, unmodified entry
        if (
          project &&
          project.name === '' &&
          (!project.description || project.description === '') &&
          (!project.technologies || project.technologies.length === 0)
        ) {
          const newProjects = localProjects.filter((_, i) => i !== editingIndex);
          setLocalProjects(newProjects);
        }
      }
    };
  }, [editingIndex]);

  const handleAdd = () => {
    const newProject: Project = {
      name: '',
      description: '',
      technologies: [],
      githubUrl: '',
      demoUrl: '',
    };
    setLocalProjects((prev) => [newProject, ...prev]);
    setEditingIndex(0); // Automatically switch to edit mode for the new project
  };

  const handleRemove = (index: number) => {
    toast.warning('Are you sure you want to remove this project?', {
      action: {
        label: 'Remove',
        onClick: () => {
          const newProjects = localProjects.filter((_, i) => i !== index);
          setLocalProjects(newProjects);
          onUpdate(newProjects); // Save to backend immediately when removing
          if (editingIndex === index) setEditingIndex(null); // If the removed project was being edited, exit edit mode
          toast.success('Project removed');
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {},
      },
    });
  };

  const handleChange = (index: number, field: keyof Project, value: string | string[]) => {
    setLocalProjects((prev) => {
      const newProjects = [...prev];
      newProjects[index] = { ...newProjects[index], [field]: value };
      return newProjects;
    });
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      const project = localProjects[editingIndex];
      const errors = validateProject(project);

      if (errors.length > 0) {
        toast.error(formatValidationErrors(errors));
        return;
      }
    }

    // Save to backend when user clicks Save
    setIsSaving(true);
    try {
      await onUpdate(localProjects);
      setEditingIndex(null);
      toast.success('Project saved successfully');
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (editingIndex !== null) {
      const project = localProjects[editingIndex];
      // Check if it's a new, unmodified entry
      if (
        project.name === '' &&
        (!project.description || project.description === '') &&
        (!project.technologies || project.technologies.length === 0)
      ) {
        const newProjects = localProjects.filter((_, i) => i !== editingIndex);
        setLocalProjects(newProjects);
      } else {
        // Revert to original data from props
        setLocalProjects(projects);
      }
    }
    setEditingIndex(null);
  };

  return (
    <section className="w-full  p-6 bg-card rounded-lg shadow-md border border-border">
      <div className=" mb-6  flex items-center justify-between  ">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Projects</h2>
            <p className="text-sm text-muted-foreground">{localProjects.length} projects</p>
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
      <div className="space-y-4 ">
        {localProjects.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
            <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">No Projects</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You haven&#39;t added any projects yet.
            </p>
            {!isPublicView && (
            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
            )}
          </div>
        ) : (
          localProjects.map((project, index) => (
            <div key={project._id || `proj-${index}`}>
              {editingIndex === index ? (
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      id={`name-${index}`}
                      label="Project Name"
                      value={project.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                    />
                    <div className="md:col-span-2">
                      <TextAreaField
                        id={`description-${index}`}
                        label="Description"
                        value={project.description || ''}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label
                        htmlFor={`technologies-${index}`}
                        className="text-sm font-medium text-foreground"
                      >
                        Technologies
                      </label>
                      <TagInput
                        id={`technologies-${index}`}
                        tags={project.technologies || []}
                        onChange={(tags) => handleChange(index, 'technologies', tags)}
                      />
                    </div>
                    <InputField
                      id={`githubUrl-${index}`}
                      label="GitHub URL"
                      value={project.githubUrl || ''}
                      onChange={(e) => handleChange(index, 'githubUrl', e.target.value)}
                    />
                    <InputField
                      id={`demoUrl-${index}`}
                      label="Demo URL"
                      value={project.demoUrl || ''}
                      onChange={(e) => handleChange(index, 'demoUrl', e.target.value)}
                    />
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
                <ProjectCard project={project} onEdit={!isPublicView ? () => setEditingIndex(index) : undefined} />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ProjectsSection;
