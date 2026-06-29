import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { ButtonLowercase } from '@/components/ui/button-lowercase';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons/icons';

import { STATUS_CONFIG } from '@/features/recruiter/application.constants';
import { ApplicationStatus } from '@/features/recruiter/application.type';
import { InfoButtons } from '@/features/recruiter/components/applications/ActionButtons';
import { ScheduleInterviewModal } from '@/features/recruiter/components/applications/ScheduleInterviewModal';
import { RecruiterNoteModal } from '@/features/recruiter/components/applications/RecruiterNoteModal';
import ReportUserModal from '@/features/recruiter/components/reports/ReportUserModal';

import {
  useGetApplicationByIdQuery,
  useUpdateApplicationStatusMutation,
} from '@/redux/features/applications/applicationApi';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);

  const { data: application, isLoading, error } = useGetApplicationByIdQuery(id!);
  const [updateStatus] = useUpdateApplicationStatusMutation();

  // Update noteText when application data loads
  useEffect(() => {
    if (application?.recruiterNote) {
      setNoteText(application.recruiterNote);
    }
  }, [application]);

  // Auto-mark as viewed
  useEffect(() => {
    const markAsViewed = async () => {
      if (application && application.status === ApplicationStatus.PENDING) {
        try {
          console.log('📍 Auto-marking as viewed:', application._id);
          
          await updateStatus({
            id: application._id,
            data: { status: 'reviewed' },
          }).unwrap();
          
          console.log('✅ Marked as viewed');
        } catch (error) {
          console.error('❌ Failed to mark as viewed:', error);
        }
      }
    };

    markAsViewed();
  }, [application, updateStatus]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  const handleStatusChange = async (status: ApplicationStatus, note?: string) => {
    if (!application) return;

    try {
      await updateStatus({
        id: application._id,
        data: { 
          status: status as 'reviewed' | 'interview_scheduled' | 'approved' | 'rejected',
          recruiterNote: note,
        },
      }).unwrap();

      toast.success(`Application status updated to ${STATUS_CONFIG[status]?.label || status}`);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to update status');
    }
  };

  // ✅ NEW: Save note without changing status
  const handleSaveNote = async () => {
    if (!application) return;

    try {
      await updateStatus({
        id: application._id,
        data: {
          status: application.status as 'reviewed' | 'interview_scheduled' | 'approved' | 'rejected',
          recruiterNote: noteText.trim(),
        },
      }).unwrap();

      toast.success('Note saved successfully');
      setEditingNote(false);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to save note');
    }
  };

  const handleCancelEdit = () => {
    setNoteText(application?.recruiterNote || '');
    setEditingNote(false);
  };

  const handleBackToList = () => {
    navigate('/recruiter/applications', { state: { fromDetail: true } });
  };

  const handleStatusChangeClick = (e: React.MouseEvent, status: ApplicationStatus) => {
    e.stopPropagation();
    setPendingStatus(status);
    setNoteModalOpen(true);
  };

  const handleConfirmStatusChange = async (note: string) => {
    if (pendingStatus) {
      await handleStatusChange(pendingStatus, note);
      setPendingStatus(null);
    }
  };

  const buttonClass = "w-24 text-xs h-7 px-2";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icons.loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <EmptyState icon={Icons.alertCircle} message="Application not found" />
        <div className="flex justify-center">
          <ButtonLowercase onClick={handleBackToList}>
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </ButtonLowercase>
        </div>
      </div>
    );
  }

  // Validate required data
  if (!application.jobSeekerId || !application.jobId) {
    console.error('❌ Missing required data:', {
      hasJobSeeker: !!application.jobSeekerId,
      hasJob: !!application.jobId,
      application,
    });
    return (
      <div className="space-y-6">
        <EmptyState icon={Icons.alertCircle} message="Invalid application data" />
        <div className="flex justify-center">
          <ButtonLowercase onClick={handleBackToList}>
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Back to list
          </ButtonLowercase>
        </div>
      </div>
    );
  }

  const candidate = application.jobSeekerId;
  const statusConfig = STATUS_CONFIG[application.status];

  return (
    <div className="space-y-4">
      <ButtonLowercase variant="ghost" onClick={handleBackToList} size="sm">
        <Icons.arrowLeft className="w-4 h-4 mr-2" />
        Back to list
      </ButtonLowercase>

      {/* Header Card */}
      <Card className="p-0">
        <CardContent className="p-3">
          <div className="flex gap-2.5">
            {/* ✅ Profile Picture hoặc Avatar */}
            {candidate.profilePicture ? (
              <img
                src={candidate.profilePicture}
                alt={`${candidate.firstName || ''} ${candidate.lastName || ''}`}
                className="w-14 h-14 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg shrink-0">
                {candidate.firstName?.[0] || '?'}
                {candidate.lastName?.[0] || '?'}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <div className="flex-1">
                  <h1 className="text-lg font-bold leading-tight">
                    {candidate.firstName} {candidate.lastName}
                  </h1>
                  <p className="text-gray-600 text-xs mt-0.5">{application.jobId.title}</p>
                </div>
                <Badge className={`${statusConfig.color} shrink-0 text-xs`}>{statusConfig.label}</Badge>
              </div>

              <div className="flex gap-2.5 mt-1.5 text-xs flex-wrap">
                <div className="flex items-center gap-1">
                  <Icons.mail className="w-3 h-3" />
                  {candidate.email}
                </div>
                <div className="flex items-center gap-1">
                  <Icons.phone className="w-3 h-3" />
                  {candidate.phone}
                </div>
                
                {/* ✅ Location */}
                {candidate.city && (
                  <div className="flex items-center gap-1">
                    <Icons.mapPin className="w-3 h-3" />
                    {candidate.city}{candidate.country && `, ${candidate.country}`}
                  </div>
                )}
              </div>

              {/* ✅ Info Buttons (Detail, View CV, Download) - Below contact info */}
              <div className="mt-2">
                <InfoButtons
                  cvUrl={application.resume || ''}
                  applicationId={application._id}
                  showViewDetail={false}
                />
              </div>

              {/* ✅ Social Links */}
              {(candidate.linkedinUrl || candidate.githubUrl || candidate.portfolioUrl) && (
                <div className="flex gap-1.5 mt-1.5">
                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                      title="LinkedIn Profile"
                    >
                      <Icons.linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {candidate.githubUrl && (
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900"
                      title="GitHub Profile"
                    >
                      <Icons.github className="w-4 h-4" />
                    </a>
                  )}
                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700"
                      title="Portfolio"
                    >
                      <Icons.globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* ✅ Action Buttons (Approve, Reject, Schedule, Report) - Right side */}
            <div className="flex flex-col gap-1.5 shrink-0">
              {/* Approve - Disable if already approved, rejected, or withdrawn */}
              <ButtonLowercase
                size="sm"
                onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.APPROVED)}
                disabled={
                  application.status === ApplicationStatus.APPROVED ||
                  application.status === ApplicationStatus.REJECTED ||
                  application.status === ApplicationStatus.WITHDRAWN
                }
                className={`${buttonClass} bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed cursor-pointer`}
              >
                <Icons.checkCircle className="w-3 h-3 mr-1" />
                Approve
              </ButtonLowercase>

              {/* Reject - Disable if already rejected, approved, or withdrawn */}
              <ButtonLowercase
                size="sm"
                variant="destructive"
                onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.REJECTED)}
                disabled={
                  application.status === ApplicationStatus.REJECTED ||
                  application.status === ApplicationStatus.APPROVED ||
                  application.status === ApplicationStatus.WITHDRAWN
                }
                className={`${buttonClass} disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer`}
              >
                <Icons.x className="w-3 h-3 mr-1" />
                Reject
              </ButtonLowercase>

              {/* Schedule - Disable if already scheduled, approved, rejected, or withdrawn */}
              <ButtonLowercase
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setScheduleModalOpen(true);
                }}
                disabled={
                  application.status === ApplicationStatus.INTERVIEW_SCHEDULED ||
                  application.status === ApplicationStatus.APPROVED ||
                  application.status === ApplicationStatus.REJECTED ||
                  application.status === ApplicationStatus.WITHDRAWN
                }
                className={`${buttonClass} bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed cursor-pointer`}
              >
                <Icons.calendar className="w-3 h-3 mr-1" />
                Schedule
              </ButtonLowercase>

              {/* Report - Always enabled */}
              <ButtonLowercase
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsReportModalOpen(true);
                }}
                className={`${buttonClass} bg-blue-600 hover:bg-blue-700 cursor-pointer`}
                title="Report this candidate"
              >
                <Icons.flag className="w-3 h-3 mr-1" />
                Report
              </ButtonLowercase>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="flex gap-3 items-start flex-wrap">
        {/* Left Column */}
        <div className="space-y-2.5 w-1/2 flex-shrink-0">
          {/* ✅ Bio / About */}
          {candidate.bio && (
            <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
              <div className="px-3 py-1 border-b">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icons.user className="w-3.5 h-3.5" />
                  About Candidate
                </h3>
              </div>
              <div className="px-3 py-1.5">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{candidate.bio}</p>
              </div>
            </Card>
          )}

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
              <div className="px-3 py-1 border-b">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icons.messageSquare className="w-3.5 h-3.5" />
                  Cover Letter
                </h3>
              </div>
              <div className="px-3 py-1.5">
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </Card>
          )}

          {/* ✅ Skills */}

          {candidate.skills && candidate.skills.length > 0 && (
            <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
              <div className="px-3 py-1 border-b">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icons.code className="w-3.5 h-3.5" />
                  Skills
                </h3>
              </div>
              <div className="px-3 py-1.5">
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* ✅ Work Experience */}
          {candidate.experience && Array.isArray(candidate.experience) && candidate.experience.length > 0 && (
            <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
              <div className="px-3 py-1 border-b">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icons.briefcase className="w-3.5 h-3.5" />
                  Work Experience
                </h3>
              </div>
              <div className="px-3 py-1.5 space-y-3">
                {candidate.experience.map((exp: any, index) => (
                  <div key={index} className="border-l-2 border-primary pl-3">
                    <h4 className="font-semibold text-sm">{exp.title || 'Position not specified'}</h4>
                    <p className="text-sm text-gray-600">{exp.company || 'Company not specified'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'}
                      {' - '}
                      {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End date not specified'}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ✅ Education */}
          {candidate.education && Array.isArray(candidate.education) && candidate.education.length > 0 && (
            <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
              <div className="px-3 py-1 border-b">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Icons.graduationCap className="w-3.5 h-3.5" />
                  Education
                </h3>
              </div>
              <div className="px-3 py-1.5 space-y-3">
                {candidate.education.map((edu: any, index) => (
                  <div key={index} className="border-l-2 border-primary pl-3">
                    <h4 className="font-semibold text-sm">{edu.degree || 'Degree not specified'}</h4>
                    <p className="text-sm text-gray-600">{edu.school || 'Institution not specified'}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start date not specified'}
                      {' - '}
                      {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End date not specified'}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-2.5 w-80 shrink-0">
          {/* ✅ Candidate Profile Card */}
          <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
            <div className="px-3 py-1 border-b">
              <h3 className="text-sm font-semibold">Candidate Profile</h3>
            </div>
            <div className="px-3 py-1.5 space-y-1.5">
              {/* Gender */}
              {candidate.gender && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-medium text-sm capitalize">{candidate.gender}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Date of Birth */}
              {candidate.dateOfBirth && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Date of Birth</p>
                    <p className="font-medium text-sm">
                      {new Date(candidate.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Address */}
              {candidate.address && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-sm">{candidate.address}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Desired Position */}
              {candidate.desiredJobTitle && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Desired Position</p>
                    <p className="font-medium text-sm">{candidate.desiredJobTitle}</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Desired Salary */}
              {candidate.desiredSalary && (
                <>
                  <div>
                    <p className="text-xs text-gray-500">Desired Salary</p>
                    <p className="font-medium text-sm">
                      {candidate.desiredSalary.toLocaleString('en-US')} VND
                    </p>
                  </div>
                  <Separator />
                </>
              )}
            </div>
          </Card>

          {/* Application Information */}
          <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
            <div className="px-3 py-1 border-b">
              <h3 className="text-sm font-semibold">Application Information</h3>
            </div>
            <div className="px-3 py-1.5 space-y-1.5">
              <div>
                <p className="text-xs text-gray-500">Applied Date</p>
                <p className="font-medium text-sm">
                  {new Date(application.appliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {application.expectedSalary && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500">Expected Salary</p>
                    <p className="font-medium text-sm">
                      {application.expectedSalary.toLocaleString('en-US')} VND
                    </p>
                  </div>
                </>
              )}

              {application.availableDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500">Available From</p>
                    <p className="font-medium text-sm">
                      {new Date(application.availableDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Recruiter Note Section */}
          <Card className="!p-0 overflow-hidden h-auto" style={{ gap: 0 }}>
            <div className="px-3 py-1 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Icons.fileText className="w-3.5 h-3.5" />
                  Your Note to Candidate
                </h3>
                {!editingNote && (
                  <ButtonLowercase
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingNote(true)}
                    className="h-7 text-xs"
                  >
                    <Icons.edit className="w-3 h-3 mr-1" />
                    {application.recruiterNote ? 'Edit' : 'Add Note'}
                  </ButtonLowercase>
                )}
              </div>
            </div>
            <div className="px-3 py-1.5">
              {editingNote ? (
                <div className="space-y-3">
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add a note for the candidate (will be visible to them)..."
                    maxLength={1000}
                    rows={6}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {noteText.length}/1000 characters
                    </p>
                    <div className="flex gap-2">
                      <ButtonLowercase
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="h-7 text-xs"
                      >
                        Cancel
                      </ButtonLowercase>
                      <ButtonLowercase
                        size="sm"
                        onClick={handleSaveNote}
                        className="h-7 text-xs"
                        disabled={noteText === application.recruiterNote}
                      >
                        <Icons.save className="w-3 h-3 mr-1" />
                        Save Note
                      </ButtonLowercase>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    💡 This note will be visible to the candidate and included in notifications.
                  </p>
                </div>
              ) : application.recruiterNote ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {application.recruiterNote}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    This note is visible to the candidate.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 italic">
                    No note added yet. Click "Add Note" to write a message for the candidate.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {candidate && application.jobId && (
        <ScheduleInterviewModal
          open={scheduleModalOpen}
          onClose={() => setScheduleModalOpen(false)}
          applicationId={application._id}
          jobId={application.jobId._id}
          jobSeekerId={candidate._id}
          candidateName={`${candidate.firstName} ${candidate.lastName}`}
          jobTitle={application.jobId.title}
        />
      )}

      {/* Report User Modal */}
      {candidate && (
        <ReportUserModal
          userId={candidate._id}
          userName={`${candidate.firstName} ${candidate.lastName}`}
          userEmail={candidate.email}
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      {/* Recruiter Note Modal */}
      {pendingStatus && (
        <RecruiterNoteModal
          open={noteModalOpen}
          onOpenChange={setNoteModalOpen}
          status={pendingStatus}
          currentNote={application.recruiterNote}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </div>
  );
}