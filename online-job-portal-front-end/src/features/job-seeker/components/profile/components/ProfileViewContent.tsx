import { useNavigate } from 'react-router';
import { Briefcase, Code, Edit2, FileText, FolderOpen, GraduationCap } from 'lucide-react';

import CVSection from '@/features/job-seeker/components/profile/components/cv-section/CVSection.tsx';
import { EducationCard } from '@/features/job-seeker/components/profile/components/education/EducationCard.tsx';
import { ProjectCard } from '@/features/job-seeker/components/profile/components/projects/ProjectCard.tsx';
import { WorkExperienceCard } from '@/features/job-seeker/components/profile/components/work-experience/WorkExperienceCard.tsx';
import type { Profile } from '@/features/job-seeker/components/profile/types/profile.types.tsx';

type ProfileControlContentProps = {
  profile: Profile;
  readOnly?: boolean;
  onUpdate?: (data: any) => void;
};

function ProfileControlContent({ profile, readOnly = false }: ProfileControlContentProps) {
  const navigate = useNavigate();

  const handleEditSection = (section: string) => {
    if (readOnly) return;
    navigate(`/profile?section=${section}`);
  };

  return (
    <div className="flex flex-col w-full rounded-2xl bg-white p-6 shadow-lg h-[calc(100vh-5rem)] overflow-auto scrollbar-hide::-webkit-scrollbar scrollbar-hide">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{readOnly ? "Profile" : "My Profile"}</h1>
        <p className="text-sm text-muted-foreground mt-1">{readOnly ? "View public profile" : "View your public profile"}</p>
      </div>

      <div className="space-y-6">
        {/* Work Experience Section */}
        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Work Experience</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.workExperiences?.length || 0} position
                  {(profile.workExperiences?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleEditSection('work')}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!profile.workExperiences || profile.workExperiences.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
                <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No Work Experience</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readOnly ? "User hasn't added any work experience yet." : "You haven't added any work experience yet."}
                </p>
              </div>
            ) : (
              profile.workExperiences.map((exp, index) => (
                <WorkExperienceCard
                  key={exp._id || `exp-${index}`}
                  experience={exp}
                  onEdit={() => handleEditSection('work')}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Job Skills</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.jobSkills?.length || 0} category
                  {(profile.jobSkills?.length || 0) === 1 ? 'y' : 'ies'}
                </p>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleEditSection('skills')}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!profile.jobSkills || profile.jobSkills.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
                <Code className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No Skill Categories</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readOnly ? "User hasn't added any skill categories yet." : "You haven't added any skill categories yet."}
                </p>
              </div>
            ) : (
              profile.jobSkills.map((category, index) => (
                <div
                  key={category._id || index}
                  className="group rounded-lg border border-border bg-background shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {category.categoryName || 'Untitled Category'}
                    </h3>
                  </div>

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
              ))
            )}
          </div>
        </section>

        {/* Projects Section */}
        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Projects</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.projects?.length || 0} projects
                </p>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleEditSection('projects')}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!profile.projects || profile.projects.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
                <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No Projects</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readOnly ? "User hasn't added any projects yet." : "You haven't added any projects yet."}
                </p>
              </div>
            ) : (
              profile.projects.map((project, index) => (
                <ProjectCard
                  key={project._id || `proj-${index}`}
                  project={project}
                  onEdit={() => handleEditSection('projects')}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>
        </section>

        {/* Education Section */}
        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Education</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.education?.length || 0} institution
                  {(profile.education?.length || 0) === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleEditSection('education')}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            {!profile.education || profile.education.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
                <GraduationCap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">No Education</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readOnly ? "User hasn't added any education yet." : "You haven't added any education yet."}
                </p>
              </div>
            ) : (
              profile.education.map((edu, index) => (
                <EducationCard
                  key={edu._id || `edu-${index}`}
                  education={edu}
                  onEdit={() => handleEditSection('education')}
                  readOnly={readOnly}
                />
              ))
            )}
          </div>
        </section>

        {/* CV Section */}
        <section className="w-full rounded-lg border border-border bg-card p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">CV/Resume</h2>
                <p className="text-sm text-muted-foreground">
                  {profile.cvUrl ? 'CV uploaded' : 'CV not uploaded yet'}
                </p>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => handleEditSection('cv')}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          <CVSection cvUrl={profile.cvUrl} onUpdate={() => { }} readOnly={readOnly} />
        </section>
      </div>
    </div>
  );
}

export default ProfileControlContent;
