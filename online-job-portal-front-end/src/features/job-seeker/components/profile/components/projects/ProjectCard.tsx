import { Edit2, Github, Globe } from 'lucide-react';

import type { Project } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

interface ProjectCardProps {
  project: Project;
  onEdit?: () => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">
          {project.name || 'Untitled Project'}
        </h3>
        {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20"
          aria-label="Edit project"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        )}
      </div>
      {project.description && (
        <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
      )}
      {project.technologies && project.technologies.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-4">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        )}
        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <Globe className="h-4 w-4" />
            Demo
          </a>
        )}
      </div>
    </div>
  );
}
