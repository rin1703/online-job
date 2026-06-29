import { Request, Response } from "express";
import {
  getJobListingService,
  createJobListingService,
  getJobListingDetailService,
  deleteJobListingService,
  getRecruiterJobDashboardService,
  updateJobListingService,
  updateJobApprovalByAdmin,
  updateJobStatusByRecruiter,
  filterAndSearchJobs,
  filterRecruiterJobsService,
  getJobFilterOptionsService,
} from "../service/jobListing.service";

const getParamAsString = (param: string | string[] | undefined, name = "parameter") => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};
import {
  AdminApprovalDTO,
  RecruiterStatusDTO,
} from "../dto/job/statusJobListing.dto";
import { FilterJobDTO } from "../dto/job/filterJob.dto";
import { RecruiterFilterDTO } from "../dto/job/recruiterFilter.dto";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { UpdateJobListingDTO } from "../dto/job/updateJobListing.dto";
import { HTTP_STATUS } from "../../helper/constants.helper";
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "../../helper/constants.helper";

export const getJobListings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const query: any = { ...req.query };

    // Cho phép ADMIN dùng status=pending|approved|rejected như một alias của approvalStatus
    if (isAdmin && typeof query.status === "string") {
      const approvalSet = ["pending", "approved", "rejected"];
      if (approvalSet.includes(query.status)) {
        query.approvalStatus = query.status;
        delete query.status;
      }
    }
    // Ensure service can detect role for admin-mapped DTOs
    if (req.user?.role) query.role = req.user.role;

    // Nếu KHÔNG phải admin → chỉ lấy bài được duyệt và active
    if (!isAdmin) {
      query.status = "active";
      query.approvalStatus = "approved";
    }

    const result = await getJobListingService(query);
    return res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      ok: false,
      message: error.message,
    });
  }
};

export const getFilteredJobs = async (req: Request, res: Response) => {
  try {
    const dto = new FilterJobDTO(req.query);
    const result = await filterAndSearchJobs(dto);
    return res.status(200).json({ ok: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

export const filterRecruiterJobs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user?.userId;
    if (!recruiterId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    const dto = new RecruiterFilterDTO(req.query);
    const result = await filterRecruiterJobsService(recruiterId, dto);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

export const getJobListingDetail = async (req: Request, res: Response) => {
  try {
    const id = getParamAsString(req.params.id, "id");
    const jobDetails = await getJobListingDetailService(id);

    if (!jobDetails) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: ERROR_MESSAGES.JOB_LISTING_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json(jobDetails);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const getRecruiterJobDashboard = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user.userId;
    const jobs = await getRecruiterJobDashboardService(recruiterId);
    return res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching recruiter dashboard:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const createJobListing = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user.userId;
    const dto = req.body;
    const result = await createJobListingService(dto, recruiterId);
    return res.status(201).json({
      success: true,
      message: "Job listing created successfully",
      data: result,
    });
  } catch (err: any) {
    console.error("Error creating job listing:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create job listing",
    });
  }
};

export const updateJobListing = async (req: Request, res: Response) => {
  try {
    const id = getParamAsString(req.params.id, "id");
    const dto = new UpdateJobListingDTO(req.body);

    const result = await updateJobListingService(id.trim(), dto);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.JOB_UPDATED,
      data: result,
    });
  } catch (error: any) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: error.message || ERROR_MESSAGES.FAILED_TO_UPDATE_JOB,
    });
  }
};

export const updateRecruiterJobStatus = async (req: Request, res: Response) => {
  try {
    const jobListingId = getParamAsString(req.params.id, "id").trim();
    // Validation đã được xử lý ở middleware
    const dto = new RecruiterStatusDTO(req.body);

    const updatedJob = await updateJobStatusByRecruiter(jobListingId, dto);
    if (!updatedJob) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.JOB_LISTING_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.JOB_STATUS_UPDATED,
      data: updatedJob,
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateAdminJobApproval = async (req: Request, res: Response) => {
  try {
    const jobListingId = getParamAsString(req.params.id, "id");
    const { approvalStatus, rejectionReason } = req.body;

    const dto = new AdminApprovalDTO({
      approvalStatus,
      rejectionReason,
    });

    const updatedJob = await updateJobApprovalByAdmin(jobListingId, dto);
    if (!updatedJob) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.JOB_LISTING_NOT_FOUND,
      });
    }

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.JOB_APPROVAL_UPDATED,
    });
  } catch (err: any) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteJobListing = async (req: Request, res: Response) => {
  try {
    const id = getParamAsString(req.params.id, "id");

    const result = await deleteJobListingService(id);
    return res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ========== GET JOB FILTER OPTIONS ==========
 * Trả về các lựa chọn filter động cho JobSeeker
 * Route: GET /api/v1/job-listings/filter-options
 */
export const getJobFilterOptions = async (req: Request, res: Response) => {
  try {
    const result = await getJobFilterOptionsService();
    return res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Lỗi khi lấy filter options",
    });
  }
};

