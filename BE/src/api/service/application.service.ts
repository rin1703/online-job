// @ts-nocheck
import Application from "../models/application.model";
import JobListing from "../models/jobListing.model";
import User from "../models/user.model";
import { Profile } from "../models/profile.model";
import { ApplicationFilterDTO } from "../dto/application/application.dto";
import mongoose from "mongoose";
import {
  sendApplicationStatusNotification,
  sendApplicationReviewedNotification,       // ✅ NEW
  sendInterviewScheduledNotification,        // ✅ NEW
  sendNewApplicationNotification,
} from "./notification.service";
import {
  validatePaginationParams,
  buildSortObject,
  calculateTotalPages,
} from "../../helper/pagination.helper";
import { JobListingStatus, JobApprovalStatus } from "../models/enum/jobListingStatus.enum";
import { ApplicationStatus } from "../models/enum/applicationStatus.enum";
import { uploadToCloudinary } from "../middleware/upload.middleware";

/**
 * ========== APPLICATION SERVICE ==========
 * Xử lý business logic cho Application operations
 * Chức năng chính: JobSeeker apply job, Recruiter review (approve/reject)
 */

// ============== HELPER FUNCTIONS ==============

/**
 * Kiểm tra xem job có đang mở cho ứng tuyển không
 */
async function isJobOpenForApplications(job: any): Promise<boolean> {
  return (job as any).status === JobApprovalStatus.APPROVED;
};

/**
 * Kiểm tra xem đã quá hạn nộp đơn chưa
 */
const isApplicationDeadlinePassed = (deadline: Date | undefined): boolean => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Lấy tên đầy đủ của user
 */
const getUserFullName = (user: any): string => {
  return `${(user as any).firstName} ${(user as any).lastName}`;
};

// ============== APPLY JOB (JobSeeker) ==============

export const applyJob = async (
  applicationData: {
    jobId: string;
    resume?: string;
    resumeLink?: string;
    fileBuffer?: Buffer;
    coverLetter?: string;
    expectedSalary?: number;
    availableDate?: Date;
    source?: string;
  },
  jobSeekerId: string
): Promise<any> => {
  try {
    // Step 1: Verify job exists and is approved
    const jobListing = await JobListing.findById(applicationData.jobId);
    if (!jobListing) {
      throw new Error("Không tìm thấy công việc");
    }

    // Step 2: Check if job is open for applications
    if (!isJobOpenForApplications(jobListing)) {
      throw new Error("Công việc này đã không còn mở cho ứng tuyển");
    }

    // Step 3: Check application deadline
    if (isApplicationDeadlinePassed(jobListing.applicationDeadline)) {
      throw new Error("Đã hết hạn nộp hồ sơ cho công việc này");
    }

    // Step 4: Verify jobSeeker exists
    const jobSeeker = await User.findById(jobSeekerId);
    if (!jobSeeker) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Step 4.5: Check for duplicate application
    const existingApplication = await Application.findOne({
      jobId: applicationData.jobId,
      jobSeekerId,
      status: { $nin: ["withdrawn"] }, // Cho phép apply lại nếu đã rút đơn
    });

    if (existingApplication) {
      throw new Error("Bạn đã nộp đơn ứng tuyển cho công việc này rồi");
    }

    // Step 5: Handle resume (file or link or text)
    let resumeUrl = "";
    let resume = applicationData.resume || "";

    if (applicationData.fileBuffer) {
      // Buffer → Upload Cloudinary
      resumeUrl = await uploadResumeBuffer(applicationData.fileBuffer);
    } else if (applicationData.resumeLink) {
      // Link → Save directly
      resumeUrl = applicationData.resumeLink;
    }

    // Get candidate profile
    const candidateProfile = await Profile.findOne({ user: jobSeekerId });

    // Step 6: Create and save application
    const newApplication = new Application({
      jobId: applicationData.jobId,
      jobSeekerId,
      recruiterId: jobListing.recruiterId,
      candidateProfileId: candidateProfile?._id,
      resume,
      resumeUrl,
      coverLetter: applicationData.coverLetter,
      expectedSalary: applicationData.expectedSalary,
      availableDate: applicationData.availableDate,
      source: applicationData.source,
      status: ApplicationStatus.PENDING,
      appliedAt: new Date(),
      statusUpdatedAt: new Date(),
    });

    const savedApplication = await newApplication.save();

    // Step 7: Send notification to recruiter
    const jobSeekerFullName = getUserFullName(jobSeeker);
    await sendNewApplicationNotification(
      jobListing.recruiterId.toString(),
      jobSeekerFullName,
      (jobListing as any).title,
      savedApplication._id.toString()
    );

    return savedApplication;
  } catch (error: any) {
    throw new Error(`Lỗi khi nộp đơn ứng tuyển: ${(error as any).message}`);
  }
};

// Helper function for uploading resume buffer
const uploadResumeBuffer = async (fileBuffer: Buffer) => {
  const result: any = await uploadToCloudinary(fileBuffer, {
    folder: "jobportal/cv-applications",
    resource_type: "raw",
    format: "pdf"
  });

  return result.secure_url;
};

// ============== GET APPLICATIONS ==============

/**
 * Xây dựng query filter từ ApplicationFilterDTO
 */
const buildApplicationQuery = (filter: ApplicationFilterDTO): any => {
  const query: any = {};

  if (filter.jobId) query.jobId = filter.jobId;
  if (filter.jobSeekerId) query.jobSeekerId = filter.jobSeekerId;
  if (filter.recruiterId) query.recruiterId = filter.recruiterId;
  if ((filter as any).status) (query as any).status = (filter as any).status;

  return query;
};

export const getApplications = async (
  filter: ApplicationFilterDTO
): Promise<{
  applications: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    // Step 1: Build query
    const query = buildApplicationQuery(filter);

    // Step 2: Calculate pagination
    const { page: currentPage, limit: itemsPerPage, skip: skipItems } = validatePaginationParams({
      page: filter.page,
      limit: filter.limit
    });

    // Step 3: Build sort
    const sort = buildSortObject(filter.sortBy, filter.sortOrder);

    // Step 4: Execute query with population
    const applications = await Application.find(query)
      .populate("jobId", "title experienceLevel salaryMin salaryMax applicationDeadline status")
      .populate("jobSeekerId", "firstName lastName email phone birthday")
      .populate("candidateProfileId", "avatar title bio location email phone expectedSalary careerObjective cv socialLinks jobSkills workExperiences education projects certificates")
      .populate("recruiterId", "firstName lastName email phone companyId")
      .populate("reviewedBy", "firstName lastName email")
      .sort(sort)
      .skip(skipItems)
      .limit(itemsPerPage)
      .lean();

    // Step 5: Merge candidate profile fields into jobSeekerId for FE convenience
    const mergedApplications = (applications as any[]).map((app) => {
      const user = (app as any).jobSeekerId || {};
      const profile = (app as any).candidateProfileId || {};
      
      // Extract social links - Get ALL platforms, not just specific ones
      const socialLinks = profile.socialLinks || [];
      
      // Find specific platforms (case-insensitive)
      const linkedinUrl = socialLinks.find((s: any) => 
        s.platform?.toLowerCase().includes('linkedin')
      )?.url || null;
      const githubUrl = socialLinks.find((s: any) => 
        s.platform?.toLowerCase().includes('github')
      )?.url || null;
      
      // Portfolio/Website - use first link that's not LinkedIn/GitHub
      const portfolioUrl = socialLinks.find((s: any) => {
        const platform = s.platform?.toLowerCase() || '';
        return !platform.includes('linkedin') && !platform.includes('github');
      })?.url || null;
      
      // Flatten jobSkills - Handle both old and new structure
      let allSkills: string[] = [];
      
      if (Array.isArray(profile.jobSkills)) {
        // New structure: [{ categoryName: 'FullStack', skills: ['React', ...] }]
        profile.jobSkills.forEach((category: any) => {
          if (category.skills && Array.isArray(category.skills)) {
            allSkills = [...allSkills, ...category.skills];
          }
        });
      } else if (profile.jobSkills && typeof profile.jobSkills === 'object') {
        // Old structure: { frontend: [], backend: [], ... }
        allSkills = [
          ...(profile.jobSkills.frontend || []),
          ...(profile.jobSkills.backend || []),
          ...(profile.jobSkills.devops || []),
          ...(profile.jobSkills.softSkills || []),
        ];
      }
      
      const enrichedUser = {
        ...user,
        _id: user._id,
        email: profile.email ?? user.email,
        phone: profile.phone ?? user.phone,
        profilePicture: profile.avatar ?? null,
        bio: profile.bio ?? null,
        skills: allSkills,
        experience: profile.workExperiences ?? [],
        education: profile.education ?? [],
        city: profile.location ?? null,
        country: null,
        address: null,
        gender: null,
        dateOfBirth: user.birthday ?? null,
        desiredJobTitle: profile.title ?? null,
        desiredSalary: profile.expectedSalary ?? null,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        cv: profile.cv ?? null,
        careerObjective: profile.careerObjective ?? null,
      };
      return { ...app, jobSeekerId: enrichedUser };
    });

    // Step 6: Calculate totals
    const totalApplications = await Application.countDocuments(query);
    const totalPages = calculateTotalPages(totalApplications, itemsPerPage);

    return {
      applications: mergedApplications as any,
      total: totalApplications,
      page: currentPage,
      totalPages,
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy danh sách đơn ứng tuyển: ${(error as any).message}`);
  }
};

// ============== GET APPLICATION BY ID ==============

export const getApplicationById = async (
  applicationId: string,
  userId: string,
  userRole: string
): Promise<any> => {
  try {
    if (!(mongoose as any).Types.ObjectId.isValid(applicationId)) {
      throw new Error("ID đơn ứng tuyển không hợp lệ");
    }

    const application = await Application.findById(applicationId)
      .populate("jobId")
      .populate("jobSeekerId", "firstName lastName email phone birthday")
      .populate("candidateProfileId", "avatar title bio location email phone expectedSalary careerObjective cv socialLinks jobSkills workExperiences education projects certificates")
      .populate("recruiterId", "firstName lastName email phone companyId")
      .populate("reviewedBy", "firstName lastName email")
      .lean();

    if (!application) {
      throw new Error("Không tìm thấy đơn ứng tuyển");
    }

    // Kiểm tra quyền: chỉ jobSeeker, recruiter hoặc admin mới được xem
    const isJobSeeker = application.jobSeekerId._id.toString() === userId;
    const isRecruiter = application.recruiterId._id.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isJobSeeker && !isRecruiter && !isAdmin) {
      throw new Error("Bạn không có quyền xem đơn ứng tuyển này");
    }

    // Merge candidate profile into jobSeekerId
    const user = (application as any).jobSeekerId || {};
    const profile = (application as any).candidateProfileId || {};
    
    // Extract social links - Get ALL platforms, not just specific ones
    const socialLinks = profile.socialLinks || [];
    
    // Find specific platforms (case-insensitive)
    const linkedinUrl = socialLinks.find((s: any) => 
      s.platform?.toLowerCase().includes('linkedin')
    )?.url || null;
    const githubUrl = socialLinks.find((s: any) => 
      s.platform?.toLowerCase().includes('github')
    )?.url || null;
    
    // Portfolio/Website - use first link that's not LinkedIn/GitHub
    const portfolioUrl = socialLinks.find((s: any) => {
      const platform = s.platform?.toLowerCase() || '';
      return !platform.includes('linkedin') && !platform.includes('github');
    })?.url || null;
    
    // Flatten jobSkills - Handle both old and new structure
    let allSkills: string[] = [];
    
    if (Array.isArray(profile.jobSkills)) {
      // New structure: [{ categoryName: 'FullStack', skills: ['React', ...] }]
      profile.jobSkills.forEach((category: any) => {
        if (category.skills && Array.isArray(category.skills)) {
          allSkills = [...allSkills, ...category.skills];
        }
      });
    } else if (profile.jobSkills && typeof profile.jobSkills === 'object') {
      // Old structure: { frontend: [], backend: [], ... }
      allSkills = [
        ...(profile.jobSkills.frontend || []),
        ...(profile.jobSkills.backend || []),
        ...(profile.jobSkills.devops || []),
        ...(profile.jobSkills.softSkills || []),
      ];
    }
    
    
    const enrichedUser = {
      ...user,
      _id: user._id,
      email: profile.email ?? user.email,
      phone: profile.phone ?? user.phone,
      profilePicture: profile.avatar ?? null,
      bio: profile.bio ?? null,
      skills: allSkills,
      experience: profile.workExperiences ?? [],
      education: profile.education ?? [],
      city: profile.location ?? null,
      country: null,
      address: null,
      gender: null,
      dateOfBirth: user.birthday ?? null,
      desiredJobTitle: profile.title ?? null,
      desiredSalary: profile.expectedSalary ?? null,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      cv: profile.cv ?? null,
      careerObjective: profile.careerObjective ?? null,
    };

    return { ...application, jobSeekerId: enrichedUser };
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy thông tin đơn ứng tuyển: ${(error as any).message}`);
  }
};

// ============== REVIEW APPLICATION (Recruiter - CHỨC NĂNG CHÍNH) ==============

export const reviewApplication = async (
  applicationId: string,
  reviewData: {
    status: "approved" | "rejected";
    recruiterNote?: string;
  },
  recruiterId: string
): Promise<any> => {
  try {
    // Xác thực đầu vào
    if (!applicationId || !(mongoose as any).Types.ObjectId.isValid(applicationId)) {
      throw new Error("ID đơn ứng tuyển không hợp lệ");
    }

    if (!recruiterId || typeof recruiterId !== "string") {
      throw new Error("Recruiter ID không hợp lệ");
    }

    // Tìm đơn ứng tuyển
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new Error("Không tìm thấy đơn ứng tuyển");
    }

    // Kiểm tra quyền sở hữu
    const applicationRecruiterId = application.recruiterId.toString();
    if (applicationRecruiterId !== recruiterId) {
      throw new Error("Bạn không có quyền xét duyệt đơn ứng tuyển này");
    }

    // Kiểm tra xem có thể xét duyệt không
    if ((application as any).status === "withdrawn") {
      throw new Error("Không thể xét duyệt đơn ứng tuyển đã bị rút lui");
    }

    // Cập nhật đơn ứng tuyển
    (application as any).status = (reviewData as any).status as ApplicationStatus;
    application.recruiterNote = reviewData.recruiterNote;
    application.reviewedAt = new Date();
    application.reviewedBy = new (mongoose as any).Types.ObjectId(recruiterId);

    // ✅ QUAN TRỌNG: Lấy các ID TRƯỚC KHI populate (chúng vẫn là ObjectIds)
    const jobIdString = application.jobId.toString();
    const jobSeekerIdString = application.jobSeekerId.toString();
    const recruiterIdString = application.recruiterId.toString();
    const applicationIdString = application._id.toString(); // ✅ THÊM: Lấy applicationId

    const updatedApplication = await application.save();

    // Populate dữ liệu liên quan (thao tác này thay đổi ID thành đối tượng đầy đủ)
    await updatedApplication.populate("jobId", "title");
    await updatedApplication.populate("jobSeekerId", "firstName lastName email");
    await updatedApplication.populate("recruiterId", "firstName lastName email");

    // Lấy thông tin công việc
    const job = await JobListing.findById(jobIdString);
    if (!job) {
      throw new Error("Không tìm thấy công việc");
    }

    // Lấy thông tin nhà tuyển dụng
    const recruiter = await User.findById(recruiterIdString);
    if (!recruiter) {
      throw new Error("Không tìm thấy nhà tuyển dụng");
    }

    // ✅ FIX: Gửi thông báo đến jobSeeker với đầy đủ params
    const recruiterFullName = `${(recruiter as any).firstName} ${(recruiter as any).lastName}`;
    
    await sendApplicationStatusNotification(
      jobSeekerIdString,        // ✅ jobSeekerId
      applicationIdString,      // ✅ THÊM: applicationId
      (job as any).title,       // ✅ jobTitle
      (reviewData as any).status, // ✅ status
      recruiterFullName,        // ✅ recruiterName
      reviewData.recruiterNote  // ✅ note (optional)
    );

    return updatedApplication.toObject();
  } catch (error: any) {
    throw new Error(`Lỗi khi xét duyệt đơn ứng tuyển: ${(error as any).message}`);
  }
};

// ============== WITHDRAW APPLICATION (JobSeeker) ==============

export const withdrawApplication = async (
  applicationId: string,
  jobSeekerId: string,
  reason?: string
): Promise<any> => {
  try {
    if (!(mongoose as any).Types.ObjectId.isValid(applicationId)) {
      throw new Error("ID đơn ứng tuyển không hợp lệ");
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      throw new Error("Không tìm thấy đơn ứng tuyển");
    }

    // Kiểm tra xem jobSeeker có sở hữu đơn này không
    if (application.jobSeekerId.toString() !== jobSeekerId) {
      throw new Error("Bạn không có quyền rút đơn ứng tuyển này");
    }

    // Kiểm tra xem đơn có thể rút không
    if (["approved", "rejected", "withdrawn"].includes((application as any).status)) {
      throw new Error(
        "Không thể rút đơn ứng tuyển đã được duyệt, từ chối hoặc đã rút trước đó"
      );
    }

    // Cập nhật đơn ứng tuyển
    (application as any).status = ApplicationStatus.WITHDRAWN;
    if (reason) {
      application.recruiterNote = `[Ứng viên rút đơn] ${reason}`;
    }

    const updatedApplication = await application.save();
    await updatedApplication.populate("jobId", "title");
    await updatedApplication.populate("jobSeekerId", "firstName lastName email");

    return updatedApplication.toObject();
  } catch (error: any) {
    throw new Error(`Lỗi khi rút đơn ứng tuyển: ${(error as any).message}`);
  }
};

// ============== GET APPLICATION STATS (Recruiter) ==============

export const getApplicationStats = async (
  recruiterId: string
): Promise<{
  totalApplications: number;
  pendingApplications: number;
  reviewedApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  interviewScheduledApplications: number;
}> => {
  try {
    // ✅ Tối ưu: Dùng aggregation thay vì fetch all và filter
    const stats = await Application.aggregate([
      { $match: { recruiterId: new mongoose.Types.ObjectId(recruiterId) } },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "reviewed"] }, 1, 0] },
          },
          approvedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          interviewScheduledApplications: {
            $sum: { $cond: [{ $eq: ["$status", "interview_scheduled"] }, 1, 0] },
          },
        },
      },
    ]);

    // Nếu không có application nào, trả về stats rỗng
    if (stats.length === 0) {
      return {
        totalApplications: 0,
        pendingApplications: 0,
        reviewedApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        interviewScheduledApplications: 0,
      };
    }

    const { _id, ...result } = stats[0];
    return result;
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy thống kê đơn ứng tuyển: ${(error as any).message}`);
  }
};

export const updateApplicationStatus = async (
  applicationId: string,
  updateData: {
    status: "reviewed" | "interview_scheduled" | "approved" | "rejected";
    recruiterNote?: string;
  },
  recruiterId: string
): Promise<any> => {
  try {
    // Xác thực đầu vào
    if (!applicationId || !(mongoose as any).Types.ObjectId.isValid(applicationId)) {
      throw new Error("ID đơn ứng tuyển không hợp lệ");
    }

    if (!recruiterId || typeof recruiterId !== "string") {
      throw new Error("Recruiter ID không hợp lệ");
    }

    // Tìm đơn ứng tuyển
    const application = await Application.findById(applicationId);
    if (!application) {
      throw new Error("Không tìm thấy đơn ứng tuyển");
    }

    // Kiểm tra quyền sở hữu
    const applicationRecruiterId = application.recruiterId.toString();
    if (applicationRecruiterId !== recruiterId) {
      throw new Error("Bạn không có quyền cập nhật đơn ứng tuyển này");
    }

    // Kiểm tra xem có thể cập nhật không
    if ((application as any).status === "withdrawn") {
      throw new Error("Không thể cập nhật đơn ứng tuyển đã bị rút lui");
    }

    // Cập nhật đơn ứng tuyển
    (application as any).status = updateData.status as ApplicationStatus;
    if (updateData.recruiterNote !== undefined) {
      application.recruiterNote = updateData.recruiterNote;
    }
    application.reviewedAt = new Date();
    application.reviewedBy = new (mongoose as any).Types.ObjectId(recruiterId);

    // ✅ QUAN TRỌNG: Lấy các ID TRƯỚC KHI populate
    const jobIdString = application.jobId.toString();
    const jobSeekerIdString = application.jobSeekerId.toString();
    const recruiterIdString = application.recruiterId.toString();
    const applicationIdString = application._id.toString();

    const updatedApplication = await application.save();

    // Populate dữ liệu liên quan
    await updatedApplication.populate("jobId", "title");
    await updatedApplication.populate("jobSeekerId", "firstName lastName email");
    await updatedApplication.populate("recruiterId", "firstName lastName email");

    // ✅ Lấy thông tin job và recruiter để gửi notification
    const job = await JobListing.findById(jobIdString);
    const recruiter = await User.findById(recruiterIdString);

    if (!job || !recruiter) {
      console.warn("Không thể lấy thông tin job hoặc recruiter để gửi notification");
      return updatedApplication.toObject();
    }

    // ✅ FIX: Gửi notification phù hợp với từng status
    try {
      const recruiterFullName = `${(recruiter as any).firstName} ${(recruiter as any).lastName}`;
      
      switch (updateData.status) {
        case "approved":
        case "rejected":
          // ✅ Dùng sendApplicationStatusNotification cho approve/reject
          await sendApplicationStatusNotification(
            jobSeekerIdString,
            applicationIdString,
            (job as any).title,
            updateData.status,
            recruiterFullName,
            updateData.recruiterNote
          );
          break;

        case "interview_scheduled":
          // ✅ Dùng sendInterviewScheduledNotification
          await sendInterviewScheduledNotification(
            jobSeekerIdString,
            applicationIdString,
            (job as any).title,
            recruiterFullName,
            updateData.recruiterNote
          );
          break;

        case "reviewed":
          // ✅ Dùng sendApplicationReviewedNotification
          await sendApplicationReviewedNotification(
            jobSeekerIdString,
            applicationIdString,
            (job as any).title,
            recruiterFullName,
            updateData.recruiterNote
          );
          break;

        default:
          console.warn(`Unknown status: ${updateData.status}`);
      }
    } catch (notificationError) {
      console.warn("Không thể gửi thông báo:", notificationError);
      // Không throw error, vẫn trả về application đã update
    }

    return updatedApplication.toObject();
  } catch (error: any) {
    throw new Error(`Lỗi khi cập nhật trạng thái đơn ứng tuyển: ${error.message}`);
  }
};

// ============== VIEW RESUME SERVICE ==============

export const viewResumeService = async (applicationId: string) => {
  const application = await Application.findById(applicationId)
    .populate("jobSeekerId", "firstName lastName email")
    .populate("jobId", "title");

  if (!application) {
    throw new Error("Không tìm thấy ứng tuyển");
  }

  return {
    resumeUrl: application.resumeUrl,
    resume: application.resume,
    candidate: application.jobSeekerId,
    job: application.jobId,
  };
};

// ============== DOWNLOAD RESUME SERVICE ==============

export const downloadResumeService = async (applicationId: string) => {
  const application = await Application.findById(applicationId);

  if (!application?.resumeUrl && !application?.resume) {
    throw new Error("Ứng viên chưa upload CV");
  }

  return application.resumeUrl || application.resume; // Controller sẽ xử lý redirect hoặc download
};