import React from "react";
import { ButtonLowercase } from "@/components/ui/button-lowercase.tsx";
import { Icons } from "@/components/icons/icons";
import { ApplicationStatus } from "@/features/recruiter/application.type";
import { toast } from "sonner";
import { RecruiterNoteModal } from "./RecruiterNoteModal";

interface ActionButtonsProps {
  cvUrl: string;
  applicationId: string;
  currentStatus: ApplicationStatus;
  currentNote?: string; // ✅ NEW: Current recruiter note
  onStatusChange: (status: ApplicationStatus, note?: string) => void; // ✅ UPDATED: Include note
  onScheduleClick?: () => void; // ✅ NEW: Open schedule interview modal
  onReportClick?: () => void; // ✅ NEW: Open report user modal
  showViewDetail?: boolean;
  onViewDetail?: () => void;
  layout?: 'combined' | 'split'; // ✅ NEW: Layout mode
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  cvUrl,
  applicationId,
  currentStatus,
  currentNote = "", // ✅ NEW
  onStatusChange,
  onScheduleClick, // ✅ NEW
  onReportClick, // ✅ NEW
  showViewDetail = false,
  onViewDetail,
  layout = 'combined', // ✅ Default to combined for backward compatibility
}) => {
  const buttonClass = "w-24 text-xs h-7 px-2";

  // ✅ Track actual CV data from API
  const [actualResumeUrl, setActualResumeUrl] = React.useState<string | null>(null);
  const [actualResume, setActualResume] = React.useState<string | null>(null);
  const [cvDataLoaded, setCvDataLoaded] = React.useState(false);

  // ✅ NEW: Modal state
  const [noteModalOpen, setNoteModalOpen] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<ApplicationStatus | null>(null);

  // ✅ Validate any valid HTTP/HTTPS URL (for viewing)
  const isValidCvUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsedUrl = new URL(url.trim());
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  // ✅ Check if URL is downloadable file (PDF, DOC, DOCX)
  const isDownloadableFile = (url: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().trim();

    // Cloudinary URLs are always downloadable
    if (lowerUrl.includes("cloudinary.com")) return true;

    // Check file extensions
    const downloadableExtensions = [".pdf", ".doc", ".docx", ".odt", ".rtf"];
    return downloadableExtensions.some((ext) => {
      // Check if URL ends with extension (with or without query params)
      return lowerUrl.includes(ext);
    });
  };

  const validCvUrl = isValidCvUrl(cvUrl);

  // ✅ Fetch actual CV data on mount to determine download availability
  React.useEffect(() => {
    if (applicationId && !cvDataLoaded) {
      fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
          const resume = data.data?.application?.resume || data.data?.resume;
          setActualResumeUrl(resumeUrl || null);
          setActualResume(resume || null);
          setCvDataLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to fetch CV data:", err);
          setCvDataLoaded(true);
        });
    }
  }, [applicationId, cvDataLoaded]);

  // ✅ Priority: Check Cloudinary URL first, then other downloadable files
  const canDownload = React.useMemo(() => {
    // Priority 1: Cloudinary URL (from database) - ALWAYS downloadable
    if (actualResumeUrl?.includes("cloudinary.com")) return true;

    // Priority 2: Check if actualResumeUrl is downloadable file
    if (actualResumeUrl && isDownloadableFile(actualResumeUrl)) return true;

    // Priority 3: Check if resume field is downloadable URL
    if (actualResume && isDownloadableFile(actualResume)) return true;

    // Priority 4: Check if resume is text (can download as .txt)
    if (actualResume && !isValidCvUrl(actualResume)) return true;

    // Fallback: Check cvUrl prop
    if (cvUrl && isDownloadableFile(cvUrl)) return true;

    return false;
  }, [actualResumeUrl, actualResume, cvUrl]);

  // ✅ Helper: Extract file extension from URL
  const getFileExtension = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf")) return ".pdf";
    if (lowerUrl.includes(".docx")) return ".docx";
    if (lowerUrl.includes(".doc")) return ".doc";
    if (lowerUrl.includes(".odt")) return ".odt";
    if (lowerUrl.includes(".rtf")) return ".rtf";
    return ".pdf"; // default fallback
  };

  // ✅ NEW: View CV with better handling
  const handleViewCV = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    try {
      toast.loading("Loading CV...");

      // ✅ Fetch CV URL with authentication
      const response = await fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.dismiss();

      if (response.ok) {
        const data = await response.json();
        console.log("📥 View CV Response:", data);

        // Check different possible response structures
        const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
        const resume = data.data?.application?.resume || data.data?.resume;

        // Priority 1: resumeUrl (Cloudinary or any URL)
        if (resumeUrl) {
          console.log("✅ Opening CV URL:", resumeUrl);
          window.open(resumeUrl, "_blank", "noopener,noreferrer");
          return;
        }

        // Priority 2: Check if resume is a valid URL
        if (resume && isValidCvUrl(resume)) {
          console.log("✅ Opening resume URL:", resume);
          window.open(resume.trim(), "_blank", "noopener,noreferrer");
          return;
        }

        // Priority 3: Fallback to resume text
        if (resume) {
          console.log("✅ Opening resume text");
          toast.info("Resume is text-based. Opening in new tab...");
          const blob = new Blob([resume], { type: "text/plain" });
          const url = window.URL.createObjectURL(blob);
          window.open(url, "_blank", "noopener,noreferrer");
          setTimeout(() => window.URL.revokeObjectURL(url), 100);
          return;
        }

        console.error("❌ No CV data found in response:", data);
      } else {
        const errorData = await response.json();
        console.error("❌ API Error:", response.status, errorData);
        toast.error(errorData.message || "Failed to load CV");
        return;
      }

      throw new Error("No valid CV found");
    } catch (error) {
      console.error("❌ View CV failed:", error);
      toast.dismiss();
      toast.error("Cannot view CV. Please try again.");

      // ✅ FALLBACK: Use direct CV URL
      if (validCvUrl) {
        window.open(cvUrl.trim(), "_blank", "noopener,noreferrer");
      }
    }
  };

  // ✅ ENHANCED: Download CV with file type validation
  const handleDownloadCV = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    try {
      toast.loading("Preparing download...");

      // ✅ STEP 1: Get CV data first to check if downloadable
      const viewResponse = await fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!viewResponse.ok) {
        throw new Error("Cannot fetch CV data");
      }

      const data = await viewResponse.json();
      const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
      const resume = data.data?.application?.resume || data.data?.resume;

      // ✅ STEP 2: Check if it's a downloadable file
      const urlToCheck = resumeUrl || resume;

      if (!isDownloadableFile(urlToCheck)) {
        toast.dismiss();
        toast.error('This CV is not a downloadable file. Please use "View CV" instead.', {
          description: "Only PDF, DOC, DOCX files can be downloaded.",
          duration: 4000,
        });
        return;
      }

      // ✅ STEP 3: Try download endpoint for Cloudinary files
      if (resumeUrl?.includes("cloudinary.com")) {
        const downloadResponse = await fetch(`/api/v1/applications/cv/${applicationId}/download`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (
          downloadResponse.ok &&
          !downloadResponse.headers.get("content-type")?.includes("application/json")
        ) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `CV_${data.data?.candidate?.firstName || "candidate"}_${data.data?.candidate?.lastName || Date.now()}.pdf`;

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);

          toast.dismiss();
          toast.success("CV downloaded successfully!");
          return;
        }
      }

      // ✅ STEP 4: Download external file URLs with correct extension
      if (resumeUrl) {
        const fileExtension = getFileExtension(resumeUrl);
        const link = document.createElement("a");
        link.href = resumeUrl;
        link.download = `CV_${data.data?.candidate?.firstName || "candidate"}_${data.data?.candidate?.lastName || Date.now()}${fileExtension}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss();
        toast.success("Download started!");
        return;
      }

      // ✅ STEP 5: Check if resume field is a downloadable URL
      if (resume && isValidCvUrl(resume) && isDownloadableFile(resume)) {
        const fileExtension = getFileExtension(resume);
        const link = document.createElement("a");
        link.href = resume.trim();
        link.download = `CV_${data.data?.candidate?.firstName || "candidate"}_${data.data?.candidate?.lastName || Date.now()}${fileExtension}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.dismiss();
        toast.success("Download started!");
        return;
      }

      // ✅ STEP 6: If resume is text, create text file
      if (resume && !isValidCvUrl(resume)) {
        const blob = new Blob([resume], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `CV_${data.data?.candidate?.firstName || "candidate"}_${data.data?.candidate?.lastName || Date.now()}.txt`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success("Resume text downloaded!");
        return;
      }

      throw new Error("No valid CV found");
    } catch (error) {
      console.error("❌ Download failed:", error);
      toast.dismiss();
      toast.error("Cannot download CV. Please try again.");
    }
  };

  // ✅ NEW: Handle status change with note modal
  const handleStatusChangeClick = (e: React.MouseEvent, status: ApplicationStatus) => {
    e.stopPropagation();
    setPendingStatus(status);
    setNoteModalOpen(true);
  };

  // ✅ NEW: Confirm status change with note
  const handleConfirmStatusChange = async (note: string) => {
    if (pendingStatus) {
      await onStatusChange(pendingStatus, note);
      setPendingStatus(null);
    }
  };

  // ✅ Info buttons component (Detail, View CV, Download)
  const InfoButtons = () => (
    <div className="flex gap-2">
      {/* Details */}
      {showViewDetail && onViewDetail && (
        <ButtonLowercase
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className={`${buttonClass} cursor-pointer`}
        >
          Details
        </ButtonLowercase>
      )}

      {/* ✅ View CV - Always enabled if has applicationId */}
      <ButtonLowercase
        variant="outline"
        size="sm"
        onClick={handleViewCV}
        className={`${buttonClass} cursor-pointer`}
        disabled={!applicationId && !validCvUrl}
        title={!applicationId && !validCvUrl ? "Resume not available" : "View Resume"}
      >
        View CV
      </ButtonLowercase>

      {/* ✅ Download CV - Only enabled for downloadable files */}
      <ButtonLowercase
        variant="outline"
        size="sm"
        onClick={handleDownloadCV}
        className={`${buttonClass} cursor-pointer`}
        disabled={!applicationId || (!canDownload && !validCvUrl)}
        title={
          applicationId
            ? !canDownload && validCvUrl
              ? 'Cannot download web links. Use "View CV" instead.'
              : "Download Resume"
            : "Application not found"
        }
      >
        Download
      </ButtonLowercase>
    </div>
  );

  // ✅ Action buttons component (Approve, Reject, Schedule, Report)
  const StatusActionButtons = () => (
    <div className="flex flex-col gap-1.5 shrink-0">
      {/* Approve */}
      <ButtonLowercase
        size="sm"
        onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.APPROVED)}
        disabled={currentStatus === ApplicationStatus.APPROVED}
        className={`${buttonClass} bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed`}
      >
        <Icons.checkCircle className="w-3 h-3 mr-1" />
        Approve
      </ButtonLowercase>

      {/* Reject */}
      <ButtonLowercase
        size="sm"
        variant="destructive"
        onClick={(e) => handleStatusChangeClick(e, ApplicationStatus.REJECTED)}
        disabled={currentStatus === ApplicationStatus.REJECTED}
        className={`${buttonClass} disabled:bg-red-300 disabled:cursor-not-allowed`}
      >
        <Icons.x className="w-3 h-3 mr-1" />
        Reject
      </ButtonLowercase>

      {/* Schedule */}
      <ButtonLowercase
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          if (onScheduleClick) {
            onScheduleClick();
          }
        }}
        disabled={currentStatus === ApplicationStatus.INTERVIEW_SCHEDULED || !onScheduleClick}
        className={`${buttonClass} bg-orange-400 hover:bg-orange-700 disabled:bg-orange-300`}
      >
        <Icons.calendar className="w-3 h-3 mr-1" />
        Schedule
      </ButtonLowercase>

      {/* ✅ NEW: Report */}
      <ButtonLowercase
        size="sm"
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation();
          if (onReportClick) {
            onReportClick();
          }
        }}
        className={`${buttonClass} bg-red-600 hover:bg-red-700 disabled:bg-red-300`}
        title="Report this candidate"
      >
        <Icons.flag className="w-3 h-3 mr-1" />
        Report
      </ButtonLowercase>
    </div>
  );

  // ✅ Combined layout (old behavior - all buttons in one column)
  if (layout === 'combined') {
    return (
      <>
        <div className="flex flex-col gap-1.5 shrink-0">
          {/* Details */}
          {showViewDetail && onViewDetail && (
            <ButtonLowercase
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              className={buttonClass}
            >
              Details
            </ButtonLowercase>
          )}

          {/* ✅ View CV */}
          <ButtonLowercase
            variant="outline"
            size="sm"
            onClick={handleViewCV}
            className={buttonClass}
            disabled={!applicationId && !validCvUrl}
            title={!applicationId && !validCvUrl ? "Resume not available" : "View Resume"}
          >
            View CV
          </ButtonLowercase>

          {/* ✅ Download CV */}
          <ButtonLowercase
            variant="outline"
            size="sm"
            onClick={handleDownloadCV}
            className={buttonClass}
            disabled={!applicationId || (!canDownload && !validCvUrl)}
            title={
              applicationId
                ? !canDownload && validCvUrl
                  ? 'Cannot download web links. Use "View CV" instead.'
                  : "Download Resume"
                : "Application not found"
            }
          >
            Download
          </ButtonLowercase>

          <StatusActionButtons />
        </div>

        {pendingStatus && (
          <RecruiterNoteModal
            open={noteModalOpen}
            onOpenChange={setNoteModalOpen}
            status={pendingStatus}
            currentNote={currentNote}
            onConfirm={handleConfirmStatusChange}
          />
        )}
      </>
    );
  }

  // ✅ Split layout - returns both components separately
  return (
    <>
      <InfoButtons />
      <StatusActionButtons />
      {pendingStatus && (
        <RecruiterNoteModal
          open={noteModalOpen}
          onOpenChange={setNoteModalOpen}
          status={pendingStatus}
          currentNote={currentNote}
          onConfirm={handleConfirmStatusChange}
        />
      )}
    </>
  );
};

// ✅ Export individual button groups for flexible layout
export const InfoButtons: React.FC<Pick<ActionButtonsProps, 'cvUrl' | 'applicationId' | 'showViewDetail' | 'onViewDetail'>> = ({
  cvUrl,
  applicationId,
  showViewDetail,
  onViewDetail,
}) => {
  const buttonClass = "w-24 text-xs h-7 px-2";
  const [actualResumeUrl, setActualResumeUrl] = React.useState<string | null>(null);
  const [actualResume, setActualResume] = React.useState<string | null>(null);
  const [cvDataLoaded, setCvDataLoaded] = React.useState(false);

  const isValidCvUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const parsedUrl = new URL(url.trim());
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isDownloadableFile = (url: string): boolean => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase().trim();
    if (lowerUrl.includes("cloudinary.com")) return true;
    const downloadableExtensions = [".pdf", ".doc", ".docx", ".odt", ".rtf"];
    return downloadableExtensions.some((ext) => lowerUrl.includes(ext));
  };

  const validCvUrl = isValidCvUrl(cvUrl);

  React.useEffect(() => {
    if (applicationId && !cvDataLoaded) {
      fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
          const resume = data.data?.application?.resume || data.data?.resume;
          setActualResumeUrl(resumeUrl || null);
          setActualResume(resume || null);
          setCvDataLoaded(true);
        })
        .catch((err) => {
          console.error("Failed to fetch CV data:", err);
          setCvDataLoaded(true);
        });
    }
  }, [applicationId, cvDataLoaded]);

  const canDownload = React.useMemo(() => {
    if (actualResumeUrl?.includes("cloudinary.com")) return true;
    if (actualResumeUrl && isDownloadableFile(actualResumeUrl)) return true;
    if (actualResume && isDownloadableFile(actualResume)) return true;
    if (actualResume && !isValidCvUrl(actualResume)) return true;
    if (cvUrl && isDownloadableFile(cvUrl)) return true;
    return false;
  }, [actualResumeUrl, actualResume, cvUrl]);

  const getFileExtension = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf")) return ".pdf";
    if (lowerUrl.includes(".docx")) return ".docx";
    if (lowerUrl.includes(".doc")) return ".doc";
    if (lowerUrl.includes(".odt")) return ".odt";
    if (lowerUrl.includes(".rtf")) return ".rtf";
    return ".pdf";
  };

  const handleViewCV = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    try {
      toast.loading("Loading CV...");
      const response = await fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.dismiss();

      if (response.ok) {
        const data = await response.json();
        const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
        const resume = data.data?.application?.resume || data.data?.resume;

        if (resumeUrl) {
          window.open(resumeUrl.trim(), "_blank", "noopener,noreferrer");
          return;
        }

        if (resume && isValidCvUrl(resume)) {
          window.open(resume.trim(), "_blank", "noopener,noreferrer");
          return;
        }

        if (resume) {
          const blob = new Blob([resume], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");
          setTimeout(() => URL.revokeObjectURL(url), 100);
          return;
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to load CV");
        return;
      }

      throw new Error("No valid CV found");
    } catch (error) {
      toast.dismiss();
      toast.error("Cannot view CV. Please try again.");
      if (validCvUrl) {
        window.open(cvUrl.trim(), "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleDownloadCV = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!applicationId) {
      toast.error("Application ID not found");
      return;
    }

    try {
      toast.loading("Preparing download...");
      const viewResponse = await fetch(`/api/v1/applications/cv/${applicationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!viewResponse.ok) {
        throw new Error("Cannot fetch CV data");
      }

      const data = await viewResponse.json();
      const resumeUrl = data.data?.application?.resumeUrl || data.data?.resumeUrl;
      const resume = data.data?.application?.resume || data.data?.resume;
      const urlToCheck = resumeUrl || resume;

      if (!isDownloadableFile(urlToCheck)) {
        toast.dismiss();
        toast.error('This CV is not a downloadable file. Please use "View CV" instead.', {
          description: "Only PDF, DOC, DOCX files can be downloaded.",
          duration: 4000,
        });
        return;
      }

      if (resumeUrl?.includes("cloudinary.com")) {
        const downloadResponse = await fetch(`/api/v1/applications/cv/${applicationId}/download`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (
          downloadResponse.ok &&
          !downloadResponse.headers.get("content-type")?.includes("application/json")
        ) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `resume_${applicationId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.dismiss();
          toast.success("CV downloaded successfully");
          return;
        }
      }

      if (resumeUrl) {
        const fileExtension = getFileExtension(resumeUrl);
        const link = document.createElement("a");
        link.href = resumeUrl;
        link.download = `resume_${applicationId}${fileExtension}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success("Download started");
        return;
      }

      if (resume && isValidCvUrl(resume) && isDownloadableFile(resume)) {
        const fileExtension = getFileExtension(resume);
        const link = document.createElement("a");
        link.href = resume;
        link.download = `resume_${applicationId}${fileExtension}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.dismiss();
        toast.success("Download started");
        return;
      }

      if (resume && !isValidCvUrl(resume)) {
        const blob = new Blob([resume], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `resume_${applicationId}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.dismiss();
        toast.success("CV downloaded as text file");
        return;
      }

      throw new Error("No valid CV found");
    } catch (error) {
      toast.dismiss();
      toast.error("Cannot download CV. Please try again.");
    }
  };

  return (
    <div className="flex gap-2">
      {showViewDetail && onViewDetail && (
        <ButtonLowercase
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail();
          }}
          className={`${buttonClass} cursor-pointer`}
        >
          Details
        </ButtonLowercase>
      )}

      <ButtonLowercase
        variant="outline"
        size="sm"
        onClick={handleViewCV}
        className={`${buttonClass} cursor-pointer`}
        disabled={!applicationId && !validCvUrl}
        title={!applicationId && !validCvUrl ? "Resume not available" : "View Resume"}
      >
        View CV
      </ButtonLowercase>

      <ButtonLowercase
        variant="outline"
        size="sm"
        onClick={handleDownloadCV}
        className={`${buttonClass} cursor-pointer`}
        disabled={!applicationId || (!canDownload && !validCvUrl)}
        title={
          applicationId
            ? !canDownload && validCvUrl
              ? 'Cannot download web links. Use "View CV" instead.'
              : "Download Resume"
            : "Application not found"
        }
      >
        Download
      </ButtonLowercase>
    </div>
  );
};