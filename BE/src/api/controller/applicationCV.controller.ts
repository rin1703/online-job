import { Request, Response } from "express";
import {
  viewResumeService,
  downloadResumeService,
  applyJob
} from "../service/application.service";
import {
  getApplications,
  getApplicationById,
  reviewApplication,
  withdrawApplication,
  getApplicationStats,
  updateApplicationStatus,
} from "../service/application.service";
import { AuthenticatedRequest, requireApplicationAccess } from "../middleware/auth.middleware";
import {
  CreateApplicationDTO,
  ReviewApplicationDTO,
  ApplicationFilterDTO,
  WithdrawApplicationDTO,
  UpdateApplicationStatusDTO,
} from "../dto/application/application.dto";
import { HTTP_STATUS } from "../../helper/constants.helper";
import Application from "../models/application.model";
import JobListing from "../models/jobListing.model";
import { UserRole } from "../models/enum/userRole.enum";

// =============================
// HELPER FUNCTIONS
// =============================

/**
 * Build application filter dựa trên user role
 * - Admin: xem tất cả
 * - Recruiter: chỉ xem applications của job listings họ tạo
 * - Job Seeker: chỉ xem applications của họ
 */
const buildApplicationFilter = (baseFilter: ApplicationFilterDTO, user: AuthenticatedRequest['user']): ApplicationFilterDTO => {
  const filter = { ...baseFilter };

  if (!user) return filter;

  switch (user.role) {
    case UserRole.ADMIN:
      // Admin xem tất cả - không cần filter thêm
      break;

    case UserRole.RECRUITER:
      // Recruiter chỉ xem applications của job listings họ tạo
      filter.recruiterId = user.userId;
      break;

    case UserRole.JOB_SEEKER:
      // Job Seeker chỉ xem applications của họ
      filter.jobSeekerId = user.userId;
      break;

    default:
      // Unknown role - không trả về gì
      break;
  }

  return filter;
};

export const handleApplyJob = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const fileBuffer = req.file?.buffer; // PDF file
    const resumeLink = req.body.resumeLink; // URL file
    const dto = new CreateApplicationDTO(req.body);

    const application = await applyJob(
      { ...(dto as any), fileBuffer, resumeLink },
      req.user!.userId
    );

    return res.status(201).json({
      success: true,
      message: "Nộp đơn ứng tuyển thành công",
      data: application,
    });

  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi nộp đơn ứng tuyển",
    });
  }
};

// =============================
// GET APPLICATIONS
// =============================
export const handleGetApplications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const filter = new ApplicationFilterDTO({
      jobId: req.query.jobId as string,
      status: req.query.status as any,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    });

    // Áp dụng role-based filter
    const roleBasedFilter = buildApplicationFilter(filter, req.user);

    const result = await getApplications(roleBasedFilter);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách đơn ứng tuyển",
    });
  }
};

// =============================
// GET APPLICATION BY ID
// =============================
export const handleGetApplicationById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const applicationId = Array.isArray(req.params.applicationId)
      ? req.params.applicationId[0]
      : req.params.applicationId;

    if (!applicationId) {
      throw new Error("applicationId is required");
    }

    const application = await getApplicationById(
      applicationId,
      req.user!.userId,
      req.user!.role
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin đơn ứng tuyển",
    });
  }
};

// =============================
// REVIEW APPLICATION
// =============================
export const handleReviewApplication = [
  requireApplicationAccess('review'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;
      const dto = new ReviewApplicationDTO(req.body);

      if (!applicationId) {
        throw new Error("applicationId is required");
      }

      const updatedApplication = await reviewApplication(
        applicationId,
        dto,
        req.user!.userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `${dto.status === "approved" ? "Duyệt" : "Từ chối"} đơn ứng tuyển thành công`,
        data: updatedApplication,
      });
    } catch (error) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message || "Lỗi khi xét duyệt đơn ứng tuyển",
      });
    }
  }
];

// =============================
// WITHDRAW APPLICATION
// =============================
export const handleWithdrawApplication = [
  requireApplicationAccess('withdraw'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;
      const dto = new WithdrawApplicationDTO(req.body);

      if (!applicationId) {
        throw new Error("applicationId is required");
      }

      const updatedApplication = await withdrawApplication(
        applicationId,
        req.user!.userId,
        dto.reason
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Rút đơn ứng tuyển thành công",
        data: updatedApplication,
      });
    } catch (error) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message || "Lỗi khi rút đơn ứng tuyển",
      });
    }
  }
];

// =============================
// GET APPLICATION STATS
// =============================
export const handleGetApplicationStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await getApplicationStats(req.user!.userId);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi khi lấy thống kê đơn ứng tuyển",
    });
  }
};

// =============================
// UPDATE APPLICATION STATUS
// =============================
export const handleUpdateApplicationStatus = [
  requireApplicationAccess('update'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const applicationId = Array.isArray(req.params.applicationId)
        ? req.params.applicationId[0]
        : req.params.applicationId;
      const dto = new UpdateApplicationStatusDTO(req.body);

      if (!applicationId) {
        throw new Error("applicationId is required");
      }

      const updatedApplication = await updateApplicationStatus(
        applicationId,
        dto,
        req.user!.userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Cập nhật trạng thái đơn ứng tuyển thành công",
        data: updatedApplication,
      });
    } catch (error) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: error.message || "Lỗi khi cập nhật trạng thái đơn ứng tuyển",
      });
    }
  }
];


// =============================
// View resume
// =============================
export const viewResumeForApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = Array.isArray(req.params.applicationId)
      ? req.params.applicationId[0]
      : req.params.applicationId;

    if (!applicationId) {
      throw new Error("applicationId is required");
    }

    const data = await viewResumeService(applicationId);

    res.json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error("View CV error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================
// Download resume
// =============================
export const downloadResumeForApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const applicationId = Array.isArray(req.params.applicationId)
      ? req.params.applicationId[0]
      : req.params.applicationId;

    if (!applicationId) {
      throw new Error("applicationId is required");
    }

    const resumeUrl = await downloadResumeService(applicationId);

    // Nếu là Cloudinary → redirect tới URL
    if (resumeUrl.startsWith("http")) {
      return res.redirect(resumeUrl);
    }

    // Nếu file local: bổ sung logic tải file ở đây
    res.status(200).send("File local download not implemented yet");
  } catch (err: any) {
    console.error("Download CV error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

// =============================
// GET ALL CVs (List all CVs with pagination)
// =============================
export const getAllCVs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobListingId, status, page = "1", limit = "10" } = req.query;

    // Build filter
    const filter: any = {};
    if (jobListingId) {
      filter.jobListingId = jobListingId;
    }
    if (status) {
      filter.status = status;
    }

    // Áp dụng role-based filtering
    const baseFilter = new ApplicationFilterDTO(filter);
    const roleBasedFilter = buildApplicationFilter(baseFilter, req.user);

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find({
        jobId: roleBasedFilter.jobId,
        status: roleBasedFilter.status,
        ...(roleBasedFilter.recruiterId && { recruiterId: roleBasedFilter.recruiterId }),
        ...(roleBasedFilter.jobSeekerId && { jobSeekerId: roleBasedFilter.jobSeekerId }),
      })
        .populate("jobSeekerId", "firstName lastName email phone")
        .populate("candidateProfileId", "avatar title bio location email phone expectedSalary careerObjective cv socialLinks jobSkills workExperiences education projects certificates")
        .populate("jobId", "title companyId experienceLevel salaryMin salaryMax isRemote isHybrid")
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Application.countDocuments({
        jobId: roleBasedFilter.jobId,
        status: roleBasedFilter.status,
        ...(roleBasedFilter.recruiterId && { recruiterId: roleBasedFilter.recruiterId }),
        ...(roleBasedFilter.jobSeekerId && { jobSeekerId: roleBasedFilter.jobSeekerId }),
      }),
    ]);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Lấy danh sách CV thành công",
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: applications,
    });
  } catch (error) {
    console.error("Error getting all CVs:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách CV",
    });
  }
};

// =============================
// GET CVs BY RECRUITER
// =============================
export const getCVsByRecruiter = [
  requireApplicationAccess('view'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { recruiterId, companyId, status } = req.query;

      if (!recruiterId && !companyId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Vui lòng cung cấp recruiterId hoặc companyId",
        });
        return;
      }

      // Tìm các job listing của recruiter/company
      const jobFilter: any = {};
      if (recruiterId) {
        jobFilter.recruiterId = recruiterId;
      }
      if (companyId) {
        jobFilter.companyId = companyId;
      }

      const jobListings = await JobListing.find(jobFilter).select("_id");
      const jobIds = jobListings.map((job) => job._id);

      // Tìm applications theo job IDs
      const appFilter: any = { jobId: { $in: jobIds } };
      if (status) {
        appFilter.status = status;
      }

      // Áp dụng role-based filtering nếu cần
      const baseFilter = new ApplicationFilterDTO(appFilter);
      const roleBasedFilter = buildApplicationFilter(baseFilter, req.user);

      const applications = await Application.find({
        jobId: { $in: jobIds },
        status: roleBasedFilter.status,
        ...(roleBasedFilter.recruiterId && { recruiterId: roleBasedFilter.recruiterId }),
        ...(roleBasedFilter.jobSeekerId && { jobSeekerId: roleBasedFilter.jobSeekerId }),
      })
        .populate("jobSeekerId", "firstName lastName email phone")
        .populate("candidateProfileId", "avatar title bio location email phone expectedSalary careerObjective cv socialLinks jobSkills workExperiences education projects certificates")
        .populate("jobId", "title companyId")
        .sort({ appliedAt: -1 });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Lấy danh sách CV thành công",
        total: applications.length,
        data: applications,
      });
    } catch (error) {
      console.error("Error getting CVs by recruiter:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Lỗi khi lấy danh sách CV",
      });
    }
  }
];
