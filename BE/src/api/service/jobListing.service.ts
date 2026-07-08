import CompanyLocation from "../models/companyLocation.model";
import JobTypeModel from "../models/jobType.model";
import JobDescriptionModel from "../models/jobDescription.model";
import JobListingModel from "../models/jobListing.model";
import IndustryModel from "../models/industry.model";
import paginationHelper from "../../helper/pagination.helper";
import {
  JobListingSummaryDTO,
  JobListingAdminDTO,
} from "../dto/job/getJobListing.dto";
import { CreateJobListingDTO } from "../dto/job/createJobListing.dto";
import { RecruiterJobPostingDTO } from "../dto/job/recuiterDashboard.dto";
import { Types } from "mongoose";
import { JobDetailDTO } from "../dto/job/jobDetail.dto";
import { UpdateJobListingDTO } from "../dto/job/updateJobListing.dto";
import { FilterJobDTO } from "../dto/job/filterJob.dto";
import { FilterOptionsResponseDTO } from "../dto/job/filterOptions.dto";
import { checkUndefined } from "../../helper/utils.helper";
import {
  AdminApprovalDTO,
  RecruiterStatusDTO,
} from "../dto/job/statusJobListing.dto";
import {
  JobListingStatus,
  JobApprovalStatus,
} from "../models/enum/jobListingStatus.enum";
import {
  PAGINATION_CONSTANTS,
  DEFAULT_VALUES,
  ERROR_MESSAGES,
} from "../../helper/constants.helper";
import SubscriptionModel from "../models/subscription.model";
import mongoose from "mongoose";
import { RecruiterFilterDTO } from "../dto/job/recruiterFilter.dto";
import User from "../models/user.model";
import Company from "../models/company.model";
import ApplicationModel from "../models/application.model";

export const getJobListingService = async (query: any) => {
  let objectPagination: {
    currentPage: number;
    limitItems: number;
    skip: number;
    totalPage: number;
  } = {
    currentPage: PAGINATION_CONSTANTS.DEFAULT_PAGE,
    limitItems: PAGINATION_CONSTANTS.DEFAULT_LIMIT,
    skip: 0,
    totalPage: 0,
  };

  const condition: any = {};

  if (query.status) condition.status = query.status;

  if (query.approvalStatus) condition.approvalStatus = query.approvalStatus;

  // role is not a DB field; ensure it's not part of the condition
  delete condition.role;

  const countRecords = await JobListingModel.countDocuments(condition);

  objectPagination = paginationHelper(objectPagination, query, countRecords);

  const isAdmin = String(query.role || "").toLowerCase() === "admin";
  let data: any[] = [];

  if (isAdmin) {
    const jobListings = await JobListingModel.find(condition)
      .select(
        "title companyId locationId salaryMin salaryMax approvalStatus createdAt recruiterId jobTypeId"
      )
      .populate("companyId", "name logo")
      .populate("locationId", "location.city")
      .populate("jobTypeId", "name")
      .populate("recruiterId", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(objectPagination.skip)
      .limit(objectPagination.limitItems)
      .lean();

    data = jobListings.map((job: any) => {
      const enriched: any = {
        ...job,
        jobType: (job.jobTypeId as any)?.name || "Unknown",
        createDate: job.createdAt,
        recruiterName:
          `${(job.recruiterId as any)?.firstName || ""} ${(job.recruiterId as any)?.lastName || ""
            }`.trim() || "Unknown Recruiter",
      };

      return new JobListingAdminDTO(enriched);
    });
  } else {
    const jobListings = await JobListingModel.find(condition)
      .select(
        "title companyId locationId salaryMin salaryMax benefits experienceLevel status approvalStatus"
      )
      .populate("companyId", "name logo")
      .populate("locationId", "location.city")
      .sort({ createdAt: -1 })
      .skip(objectPagination.skip)
      .limit(objectPagination.limitItems)
      .lean();

    data = jobListings.map((job) => new JobListingSummaryDTO(job));
  }

  return {
    ok: true,
    pagination: objectPagination,
    totalRecords: countRecords,
    data,
  };
};

export const filterRecruiterJobsService = async (
  recruiterId: string,
  dto: RecruiterFilterDTO
) => {
  if (!recruiterId) throw new Error("Recruiter ID is required");

  const condition: any = { recruiterId };

  // keyword on title or exact _id if valid
  if (dto.keyword) {
    const regex = new RegExp(dto.keyword, "i");
    const or: any[] = [{ title: regex }];
    if (Types.ObjectId.isValid(dto.keyword)) {
      or.push({ _id: new Types.ObjectId(dto.keyword) });
    }
    condition.$or = or;
  }

  if (dto.status) condition.status = dto.status;
  if (dto.experienceLevel) condition.experienceLevel = dto.experienceLevel;

  // sorting
  const allowedSort: any = {
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    views: "views",
  };
  const sortField = allowedSort[dto.sortBy || "createdAt"] || "createdAt";
  const sortDir =
    (dto.sortDirection || "DESC").toUpperCase() === "ASC" ? 1 : -1;
  const sort: any = { [sortField]: sortDir };

  const skip = (dto.page - 1) * dto.limit;

  const [rows, total] = await Promise.all([
    JobListingModel.find(condition)
      .sort(sort)
      .skip(skip)
      .limit(dto.limit)
      .lean(),
    JobListingModel.countDocuments(condition),
  ]);

  // Get total applications for each job
  const jobIds = rows.map((job: any) => job._id);
  const applicationCounts = await ApplicationModel.aggregate([
    { $match: { jobId: { $in: jobIds } } },
    { $group: { _id: "$jobId", count: { $sum: 1 } } },
  ]);

  const applicationCountMap = new Map(
    applicationCounts.map((item) => [item._id.toString(), item.count])
  );

  const data: RecruiterJobPostingDTO[] = rows.map((job: any) => ({
    id: job._id.toString(),
    title: job.title,
    salaryMin: job.salaryMin || 0,
    salaryMax: job.salaryMax || 0,
    experienceLevel: job.experienceLevel,
    status: job.status,
    views: job.views || 0,
    isDeleted: job.isDeleted || false,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    approvalStatus: job.approvalStatus,
    totalApplications: applicationCountMap.get(job._id.toString()) || 0,
  }));

  return {
    ok: true,
    data,
    pagination: {
      page: dto.page,
      limit: dto.limit,
      total,
      totalPages: Math.ceil(total / dto.limit),
    },
  };
};

export const filterAndSearchJobs = async (dto: FilterJobDTO) => {
  const query: any = {};

  // 🔍 Keyword search (title, skills)
  if (dto.keyword) {
    const regex = new RegExp(dto.keyword, "i");
    query.$or = [
      { title: regex },
      { skills: regex },
      { "company.name": regex },
    ];
  }

  // 🎯 Basic filters
  // 🎯 Basic filters
  // Accept industry names (e.g. "Information Technology") or ids
  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let industries: any = (dto as any).industryIds || (dto as any).industry;
  if (typeof industries === "string") industries = [industries];
  if (Array.isArray(industries) && industries.length > 0) {
    // split into ObjectId values and name values
    const idValues = industries.filter((v: any) => Types.ObjectId.isValid(String(v))).map((v: any) => new Types.ObjectId(String(v)));
    const nameValues = industries.filter((v: any) => !Types.ObjectId.isValid(String(v)));

    const resolvedIds: any[] = [];
    if (idValues.length > 0) resolvedIds.push(...idValues);
    if (nameValues.length > 0) {
      // find industries by exact name (case-insensitive)
      const orQueries = nameValues.map((n: any) => ({ name: new RegExp(`^${escapeRegex(String(n))}$`, "i") }));
      const found = await IndustryModel.find({ $or: orQueries }).select("_id").lean();
      resolvedIds.push(...found.map((f: any) => f._id));
    }

    if (resolvedIds.length > 0) {
      query.industryIds = { $in: resolvedIds };
    } else {
      // no matching industries -> force empty result
      query.industryIds = { $in: [] };
    }
  }

  // Accept job type by name (e.g. "full-time") or id
  if ((dto as any).jobType || dto.jobTypeId) {
    const jtValue = (dto as any).jobType || dto.jobTypeId;
    if (Types.ObjectId.isValid(String(jtValue))) {
      query.jobTypeId = new Types.ObjectId(String(jtValue));
    } else if (typeof jtValue === "string") {
      const jt = await JobTypeModel.findOne({ name: new RegExp(`^${escapeRegex(jtValue)}$`, "i") }).select("_id").lean();
      if (jt && jt._id) query.jobTypeId = jt._id;
      else query.jobTypeId = { $in: [] };
    }
  }

  // Locations: accept company-location _id(s) or city names
  if (dto.locationId) {
    // single value may be city name or id
    if (Types.ObjectId.isValid(String(dto.locationId))) {
      query.locationId = new Types.ObjectId(String(dto.locationId));
    } else if (typeof dto.locationId === "string") {
      const cityRegex = new RegExp(`^${escapeRegex(dto.locationId)}$`, "i");
      const locs = await CompanyLocation.find({ "location.city": cityRegex }).select("_id").lean();
      const locIds = locs.map((l: any) => l._id);
      if (locIds.length > 0) query.locationId = { $in: locIds };
      else query.locationId = { $in: [] };
    }
  }

  // 📍 Multiple location IDs or city names
  if (dto.locationIds && Array.isArray(dto.locationIds) && dto.locationIds.length > 0) {
    const ids = dto.locationIds.filter((v: any) => Types.ObjectId.isValid(String(v))).map((v: any) => new Types.ObjectId(String(v)));
    const names = dto.locationIds.filter((v: any) => !Types.ObjectId.isValid(String(v)));

    const resolvedLocIds: any[] = [];
    if (ids.length > 0) resolvedLocIds.push(...ids);
    if (names.length > 0) {
      const orQueries = names.map((n: any) => ({ "location.city": new RegExp(`^${escapeRegex(String(n))}$`, "i") }));
      const found = await CompanyLocation.find({ $or: orQueries }).select("_id").lean();
      resolvedLocIds.push(...found.map((f: any) => f._id));
    }

    if (resolvedLocIds.length > 0) query.locationId = { $in: resolvedLocIds };
    else query.locationId = { $in: [] };
  }
  // 📍 City filter -> resolve CompanyLocation IDs by city name from FE 'location.city' or dto.city
  else if (!dto.locationId && dto.city) {
    const cityRegex = new RegExp(`^${escapeRegex(dto.city)}$`, "i");
    const locs = await CompanyLocation.find({ "location.city": cityRegex })
      .select("_id")
      .lean();
    const locIds = locs.map((l: any) => l._id);
    if (locIds.length > 0) {
      query.locationId = { $in: locIds };
    } else {
      // No matches, force empty result set quickly
      query.locationId = { $in: [] };
    }
  }
  // 📊 Experience level filter
  if (dto.experienceLevels && Array.isArray(dto.experienceLevels) && dto.experienceLevels.length > 0) {
    query.experienceLevel = { $in: dto.experienceLevels };
  } else if (dto.experienceLevel) {
    query.experienceLevel = dto.experienceLevel;
  }
  if (dto.status) query.status = dto.status;
  if (dto.approvalStatus) query.approvalStatus = dto.approvalStatus;

  // 💰 Salary range
  if (dto.salaryMin || dto.salaryMax) {
    query.$and = [];
    if (dto.salaryMin) query.$and.push({ salaryMax: { $gte: dto.salaryMin } });
    if (dto.salaryMax) query.$and.push({ salaryMin: { $lte: dto.salaryMax } });
  }

  // 🏠 Work mode (FE uses isRemote / isHybrid directly)
  if (dto.isRemote !== undefined) query.isRemote = dto.isRemote;
  if (dto.isHybrid !== undefined) query.isHybrid = dto.isHybrid;

  // 📄 Pagination
  const skip = (dto.page - 1) * dto.limit;

  // 🔽 Sort options
  const sortOptions: any = {};
  switch (dto.sortBy) {
    case "newest":
      sortOptions.createdAt = -1;
      break;
    case "oldest":
      sortOptions.createdAt = 1;
      break;
    case "highestSalary":
      sortOptions.salaryMax = -1;
      break;
    case "lowestSalary":
      sortOptions.salaryMin = 1;
      break;
    default:
      // Default to newest if invalid sort option provided
      sortOptions.createdAt = -1;
      break;
  }

  // 🔹 Execute query and map to DTO
  const [results, total] = await Promise.all([
    JobListingModel.find(query)
      .select(
        "title companyId locationId salaryMin salaryMax benefits experienceLevel"
      )
      .populate("companyId", "name logo")
      .populate("locationId", "location.city")
      .sort(sortOptions)
      .skip(skip)
      .limit(dto.limit)
      .lean(),
    JobListingModel.countDocuments(query),
  ]);

  const data = results.map((job) => new JobListingSummaryDTO(job));

  return {
    data,
    pagination: {
      page: dto.page,
      limit: dto.limit,
      total,
      totalPages: Math.ceil(total / dto.limit),
    },
  };
};

export const getRecruiterJobDashboardService = async (
  recruiterId: string
): Promise<RecruiterJobPostingDTO[]> => {
  if (!recruiterId) {
    throw new Error(ERROR_MESSAGES.RECRUITER_ID_REQUIRED);
  }

  const jobs = await JobListingModel.find({ recruiterId })
    .sort({ createdAt: -1 })
    .lean();

  return jobs.map((job: any) => ({
    id: job._id.toString(),
    title: job.title,
    salaryMin: job.salaryMin || DEFAULT_VALUES.INITIAL_VIEWS,
    salaryMax: job.salaryMax || DEFAULT_VALUES.INITIAL_VIEWS,
    experienceLevel: job.experienceLevel,
    status: job.status,
    views: job.views || DEFAULT_VALUES.INITIAL_VIEWS,
    isDeleted: job.isDeleted || DEFAULT_VALUES.IS_DELETED,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    approvalStatus: job.approvalStatus,
  }));
};

export const getJobListingDetailService = async (
  jobListingId: string
): Promise<JobDetailDTO | null> => {
  const cleanId = (jobListingId || "").trim();
  if (!Types.ObjectId.isValid(cleanId)) {
    throw new Error("Invalid job ID");
  }

  await JobListingModel.updateOne({ _id: cleanId }, { $inc: { views: 1 } });

  const job = await JobListingModel.findById(cleanId)
    .populate("companyId", "name logo")
    .populate({
      path: "locationId",
      select: "location",
    })
    .populate("jobTypeId", "name")
    .populate("recruiterId", "firstName lastName")
    .lean();

  if (job) {
    console.log("[getJobListingDetailService] Found job:", job._id, "Recruiter:", job.recruiterId);
  }

  if (!job) return null;

  const jobDesc = job.jobDescriptionId
    ? await JobDescriptionModel.findById(job.jobDescriptionId).lean()
    : null;

  const dto: JobDetailDTO = {
    id: job._id.toString(),
    title: job.title,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    experienceLevel: job.experienceLevel,
    applicationDeadline: job.applicationDeadline || null,
    numberOfPositions: job.numberOfPositions,
    jobType: (job.jobTypeId as any)?.name || "Unknown",
    location: {
      address: (job.locationId as any)?.location?.address || "",
      district: (job.locationId as any)?.location?.district || "",
      city: (job.locationId as any)?.location?.city || "",
    },
    company: {
      name: (job.companyId as any)?.name || "Unknown",
      logo: (job.companyId as any)?.logo || null,
    },
    overview: (jobDesc as any)?.overview || [],
    responsibilities: (jobDesc as any)?.responsibilities || [],
    requirementSkill: (jobDesc as any)?.requirements || [],
    benefits: (jobDesc as any)?.benefits || [],
    niceToHave: (jobDesc as any)?.niceToHave || [],
    workingSchedule: (jobDesc as any)?.workingSchedule || [],
    applicationDate: job.applicationDeadline || null,
    isRemote: job.isRemote || false,
    recruiterId: (job.recruiterId as any)?._id?.toString() || (job.recruiterId ? job.recruiterId.toString() : ""),
    recruiterName: `${(job.recruiterId as any)?.firstName || ""} ${(job.recruiterId as any)?.lastName || ""}`.trim() || "Unknown Recruiter",
  };

  return dto;
};

export const validateRecruiterSubscription = async (userId: string) => {
  const now = new Date();

  // 1) Subscription phải active & còn hạn
  const subscription = await SubscriptionModel.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!subscription) {
    throw new Error("No active subscription or subscription expired");
  }

  // 3) Kiểm tra limit
  if (subscription.features.jobPostings.limit <= 0) {
    throw new Error("No available job posting slots remaining");
  }

  return subscription;
};

//test hàm này
export const createJobListingService = async (
  dto: CreateJobListingDTO,
  recruiterId: string
) => {
  const subscription = await validateRecruiterSubscription(recruiterId);

  // 1) Resolve recruiter -> company
  const user = await User.findById(recruiterId)
    .select("companyId managedLocationId managerId")
    .lean<{
      companyId?: Types.ObjectId | string;
      managedLocationId?: Types.ObjectId | string;
      managerId?: Types.ObjectId | string;
    }>();

  if (!user || !user.companyId)
    throw new Error("Recruiter has no company assigned");
  const companyId = new Types.ObjectId((user.companyId as any).toString());
  console.log("Resolved companyId:", companyId.toString());

  // 2) Resolve industryIds from company
  const company = await Company.findById(companyId)
    .select("industryId")
    .lean<{ industryId?: Types.ObjectId | string }>();
  if (!company || !company.industryId) {
    throw new Error("Công ty của bạn chưa cấu hình Ngành nghề (Industry). Vui lòng vào trang Hồ sơ công ty cập nhật thông tin này trước khi tạo tin tuyển dụng.");
  }
  const industryIds = [
    new Types.ObjectId((company.industryId as any).toString()),
  ];

  // 3) Resolve location: prefer user's managedLocationId, then managerId, then HQ/any company location
  let locationId: Types.ObjectId | null = null;
  if (user.managedLocationId) {
    locationId = new Types.ObjectId((user.managedLocationId as any).toString());
  } else if (user.managerId) {
    locationId = new Types.ObjectId((user.managerId as any).toString());
  }

  if (!locationId) {
    const locations = await CompanyLocation.find({ companyId }).lean();
    if (locations.length > 0) {
      const hq = locations.find((loc: any) => loc.isHeadquarters) || locations[0];
      locationId = new Types.ObjectId((hq._id as any).toString());
    }
  }

  if (!locationId) {
    throw new Error("Công ty chưa đăng ký địa điểm làm việc. Vui lòng thêm địa điểm làm việc trong trang quản lý trước khi tạo tin tuyển dụng.");
  }

  // 4) Resolve jobType by name (case-insensitive)
  let jt = await JobTypeModel.findOne({
    name: new RegExp(`^${dto.jobType}$`, "i"),
  })
    .select("_id")
    .lean<{ _id: Types.ObjectId | string } | null>();
  if (!jt) {
    const newJt = await JobTypeModel.create({
      name: dto.jobType,
      description: `${dto.jobType} job position`,
    });
    jt = { _id: newJt._id };
  }
  const jobTypeId = new Types.ObjectId((jt._id as any).toString());

  // 5) Create job listing
  const applicationDeadline = dto.applicationDeadline
    ? new Date(dto.applicationDeadline)
    : undefined;

  const jobListing = await JobListingModel.create({
    title: dto.title,
    companyId,
    recruiterId: new Types.ObjectId(recruiterId),
    locationId,
    jobTypeId,
    industryIds,
    experienceLevel: dto.experienceLevel,
    salaryMin: dto.salaryMin,
    salaryMax: dto.salaryMax,
    salaryCurrency: dto.salaryCurrency || DEFAULT_VALUES.SALARY_CURRENCY,
    numberOfPositions: dto.numberOfPositions || DEFAULT_VALUES.JOB_POSITIONS,
    applicationDeadline,
    status: JobListingStatus.DRAFT,
    approvalStatus: JobApprovalStatus.PENDING,
    isDeleted: DEFAULT_VALUES.IS_DELETED,
    deletedAt: null,
    isRemote: dto.isRemote ?? false,
  });

  const jobDescription = await JobDescriptionModel.create({
    jobListingId: jobListing._id,
    overview: dto.overview,
    responsibilities: dto.responsibilities,
    requirements: dto.requirements,
    benefits: dto.benefits || [],
    niceToHave: dto.niceToHave || [],
    workingSchedule: dto.workingSchedule || [],
  });

  jobListing.jobDescriptionId = new mongoose.Types.ObjectId(
    jobDescription._id.toString()
  );
  await jobListing.save();

  // decrement available slot and mark subscription usage
  subscription.features.jobPostings.limit -= 1;

  if (!subscription.firstUsageAt) {
    subscription.firstUsageAt = new Date();
  }

  subscription.usageCount = (subscription.usageCount || 0) + 1;
  subscription.markModified("features");
  await subscription.save();

  // ✅ 4️⃣ Populate và return
  const populated = await JobListingModel.findById(jobListing._id)
    .populate("companyId", "name logo isVerified")
    .populate("locationId", "location")
    .populate("jobTypeId", "name")
    .populate("industryIds", "name")
    .lean();

  return {
    ...populated,
    jobDescription: jobDescription.toObject(),
  };
};

export const updateJobCore = async (
  jobListingId: string,
  dto: UpdateJobListingDTO
) => {
  const updateFields = checkUndefined(dto, [
    "title",
    "jobType",
    "experienceLevel",
    "salaryMin",
    "salaryMax",
    "salaryCurrency",
    "numberOfPositions",
    "applicationDeadline",
    "isRemote",
  ]);

  // Nếu `jobType` là chuỗi, tìm `jobTypeId` tương ứng
  if (dto.jobType) {
    let jobType = await JobTypeModel.findOne({
      name: new RegExp(`^${dto.jobType}$`, "i"), // Tìm theo tên không phân biệt hoa thường
    }).select("_id");

    if (!jobType) {
      jobType = await JobTypeModel.create({
        name: dto.jobType,
        description: `${dto.jobType} job position`,
      });
    }

    updateFields.jobTypeId = jobType._id; // Cập nhật `jobTypeId`
    delete updateFields.jobType; // Xóa `jobType` để tránh cập nhật trực tiếp
  }

  if (Object.keys(updateFields).length > 0) {
    updateFields.approvalStatus = JobApprovalStatus.PENDING; // Đặt trạng thái phê duyệt thành PENDING
    await JobListingModel.updateOne({ _id: jobListingId }, updateFields);
  }
};

export const updateJobDescription = async (
  jobListingId: string,
  dto: UpdateJobListingDTO
) => {
  const descFields = checkUndefined(dto, [
    "overview",
    "responsibilities",
    "requirements",
    "benefits",
    "niceToHave",
    "workingSchedule",
  ]);

  if (Object.keys(descFields).length > 0) {
    await JobDescriptionModel.updateOne({ jobListingId }, descFields);
    await JobListingModel.updateOne(
      { _id: jobListingId },
      { approvalStatus: JobApprovalStatus.PENDING }
    );
  }
};

export const updateJobListingService = async (
  jobListingId: string,
  dto: UpdateJobListingDTO
) => {
  const cleanId = jobListingId.trim();
  await updateJobCore(cleanId, dto);
  await updateJobDescription(cleanId, dto);

  const updated = await JobListingModel.findById(jobListingId)
    .populate("companyId", "name logo isVerified")
    .populate("locationId", "location")
    .populate("jobTypeId", "name")
    .lean();

  const updatedJobDesc = await JobDescriptionModel.findOne({
    jobListingId: cleanId,
  }).lean();

  return { ...updated, jobDescription: updatedJobDesc };
};

export const updateJobStatusByRecruiter = async (
  jobListingId: string,
  dto: RecruiterStatusDTO
) => {
  const allowedStatuses = Object.values(JobListingStatus);
  if (!allowedStatuses.includes(dto.status as JobListingStatus)) {
    throw new Error(ERROR_MESSAGES.INVALID_STATUS_VALUE);
  }

  // 1. Lấy job trước để kiểm tra approvalStatus
  const existingJob = await JobListingModel.findById(jobListingId);
  if (!existingJob) throw new Error("Job not found");

  // 2. Chỉ cho phép đổi status nếu đã được admin duyệt
  if (existingJob.approvalStatus !== "approved") {
    throw new Error(
      "You can only change the status of job listings that are approved by admin"
    );
  }

  // 3. Tiến hành update status như code cũ
  const updated = await JobListingModel.findByIdAndUpdate(
    jobListingId,
    { status: dto.status },
    { new: true }
  )
    .populate("companyId", "name logo isVerified")
    .populate("locationId", "location")
    .lean();

  return updated;
};

// Test hàm này
export const updateJobApprovalByAdmin = async (
  jobListingId: string,
  dto: AdminApprovalDTO
) => {
  const allowedStatuses = ["approved", "rejected"];
  if (!allowedStatuses.includes(dto.approvalStatus)) {
    throw new Error("Invalid approval status");
  }

  // 1. Lấy job hiện tại
  const existingJob = await JobListingModel.findById(jobListingId);
  if (!existingJob) throw new Error("Job not found");

  const updateFields: any = {
    approvalStatus: dto.approvalStatus,
  };

  /** ------------------------------------------
   * 2. Nếu ADMIN DUYỆT → Lấy visibleDuration từ Subscription
   * ------------------------------------------ */
  if (dto.approvalStatus === "approved") {
    const subscription = await SubscriptionModel.findOne({
      userId: existingJob.recruiterId,
      status: "active",
    }).populate("packageId");

    if (!subscription) {
      throw new Error("Recruiter does not have an active subscription");
    }

    const pkg: any = subscription.packageId;

    const visibleDuration = pkg?.features?.jobPostings?.visibleDuration;
    if (!visibleDuration) {
      throw new Error("Subscription package missing visibleDuration");
    }

    const now = new Date();
    const autoHideAt = new Date(now);
    autoHideAt.setDate(now.getDate() + visibleDuration);

    updateFields.autoHideAt = autoHideAt;
    updateFields.status = "active";
  }

  /** ------------------------------------------
   * 3. Nếu ADMIN TỪ CHỐI
   * ------------------------------------------ */
  if (dto.approvalStatus === "rejected") {
    updateFields.rejectionReason = dto.rejectionReason || "Not specified";
  }

  // 4. Update job
  const updated = await JobListingModel.findByIdAndUpdate(
    jobListingId,
    updateFields,
    { new: true }
  )
    .populate("companyId", "name logo isVerified")
    .populate("locationId", "location")
    .lean();

  /** ------------------------------------------
   * 5. Hoàn slot nếu reject lần đầu
   * ------------------------------------------ */
  const isFirstTimeRejection =
    existingJob.approvalStatus === "pending" &&
    dto.approvalStatus === "rejected";

  if (isFirstTimeRejection) {
    const subscription = await SubscriptionModel.findOne({
      userId: existingJob.recruiterId,
      status: "active",
    });

    if (subscription) {
      subscription.features.jobPostings.limit += 1;
      await subscription.save();
    }
  }

  return updated;
};

export const deleteJobListingService = async (jobId: string) => {
  if (!Types.ObjectId.isValid(jobId)) {
    throw new Error(ERROR_MESSAGES.INVALID_JOB_ID);
  }

  const job = await JobListingModel.findById(jobId);
  if (!job) {
    throw new Error(ERROR_MESSAGES.JOB_LISTING_NOT_FOUND);
  }

  if (job.isDeleted) {
    throw new Error("Job already deleted");
  }

  job.isDeleted = true;
  job.deletedAt = new Date();

  await job.save();

  return {
    message: "Job listing deleted successfully",
    deletedAt: job.deletedAt,
  };
};

/**
 * ========== GET JOB FILTER OPTIONS (Dynamic) ==========
 * Trả về các lựa chọn filter động dựa trên data thực tế trong database
 * Chỉ lấy từ các job đang active và approved
 */
export const getJobFilterOptionsService = async (): Promise<FilterOptionsResponseDTO> => {
  try {
    // Base condition: chỉ lấy job active và approved
    const baseCondition = {
      status: "active",
      approvalStatus: "approved",
      isDeleted: { $ne: true },
    };

    // 1. Lấy danh sách Industries với job count
    const industriesAggregation = await JobListingModel.aggregate([
      { $match: baseCondition },
      { $unwind: "$industryIds" },
      {
        $group: {
          _id: "$industryIds",
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
    ]);

    // Populate industry names và loại bỏ các giá trị null/undefined
    const industriesWithNames = (await Promise.all(
      industriesAggregation.map(async (item) => {
        // Bỏ qua nếu _id null hoặc undefined
        if (!item._id) return null;

        const industry = await IndustryModel.findById(item._id).select("name").lean();

        // Bỏ qua nếu không tìm thấy industry hoặc không có tên
        if (!industry || !industry.name) return null;

        return {
          _id: item._id.toString(),
          name: industry.name,
          jobCount: item.jobCount,
        };
      })
    )).filter((item): item is { _id: string; name: string; jobCount: number } => item !== null);

    // 2. Lấy danh sách Job Types với job count
    const jobTypesAggregation = await JobListingModel.aggregate([
      { $match: baseCondition },
      {
        $group: {
          _id: "$jobTypeId",
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
    ]);

    // Populate job type names và loại bỏ các giá trị null/undefined
    const jobTypesWithNames = (await Promise.all(
      jobTypesAggregation.map(async (item) => {
        // Bỏ qua nếu _id null hoặc undefined
        if (!item._id) return null;

        const jobType = await JobTypeModel.findById(item._id).select("name").lean();

        // Bỏ qua nếu không tìm thấy jobType hoặc không có tên
        if (!jobType || !jobType.name) return null;

        return {
          _id: item._id.toString(),
          name: jobType.name,
          jobCount: item.jobCount,
        };
      })
    )).filter((item): item is { _id: string; name: string; jobCount: number } => item !== null);

    // 3. Lấy danh sách Locations với job count
    const locationsAggregation = await JobListingModel.aggregate([
      { $match: baseCondition },
      {
        $group: {
          _id: "$locationId",
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
    ]);

    // Populate location details và loại bỏ các giá trị null/undefined
    const locationsWithDetails = (await Promise.all(
      locationsAggregation.map(async (item) => {
        // Bỏ qua nếu _id null hoặc undefined
        if (!item._id) return null;

        const location = await CompanyLocation.findById(item._id)
          .select("location.city location.country")
          .lean();

        // Bỏ qua nếu không tìm thấy location hoặc không có city
        if (!location || !(location as any)?.location?.city) return null;

        return {
          _id: item._id.toString(),
          city: (location as any).location.city,
          country: (location as any).location.country, // Country field not stored in DB
          jobCount: item.jobCount,
        };
      })
    )).filter((item): item is { _id: string; city: string; country: string; jobCount: number } => item !== null && item.city !== undefined)

    // 4. Lấy danh sách Experience Levels với job count
    const experienceLevelsAggregation = await JobListingModel.aggregate([
      { $match: baseCondition },
      {
        $group: {
          _id: "$experienceLevel",
          jobCount: { $sum: 1 },
        },
      },
      { $sort: { jobCount: -1 } },
    ]);

    const experienceLevels = experienceLevelsAggregation.map((item) => ({
      value: item._id,
      label: formatExperienceLevel(item._id),
      jobCount: item.jobCount,
    }));

    // 5. Lấy salary range (min và max)
    const salaryStats = await JobListingModel.aggregate([
      { $match: baseCondition },
      {
        $group: {
          _id: null,
          minSalary: { $min: "$salaryMin" },
          maxSalary: { $max: "$salaryMax" },
        },
      },
    ]);

    const salaryRange = {
      min: salaryStats[0]?.minSalary || 0,
      max: salaryStats[0]?.maxSalary || 0,
      currency: "VND",
    };

    // 6. Lấy work modes count
    const workModesStats = await JobListingModel.aggregate([
      { $match: baseCondition },
      {
        $group: {
          _id: null,
          remote: { $sum: { $cond: ["$isRemote", 1, 0] } },
          hybrid: { $sum: { $cond: ["$isHybrid", 1, 0] } },
          total: { $sum: 1 },
        },
      },
    ]);

    const workModes = {
      remote: workModesStats[0]?.remote || 0,
      hybrid: workModesStats[0]?.hybrid || 0,
      onsite: (workModesStats[0]?.total || 0) - (workModesStats[0]?.remote || 0) - (workModesStats[0]?.hybrid || 0),
    };

    // 7. Tổng số job active
    const totalActiveJobs = await JobListingModel.countDocuments(baseCondition);

    return {
      success: true,
      message: "Lấy danh sách filter options thành công",
      data: {
        industries: industriesWithNames,
        jobTypes: jobTypesWithNames,
        locations: locationsWithDetails,
        experienceLevels,
        salaryRange,
        workModes,
        totalActiveJobs,
      },
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy filter options: ${error.message}`);
  }
};

/**
 * Helper function: Format experience level for display
 */
function formatExperienceLevel(level: string): string {
  const levelMap: Record<string, string> = {
    entry: "Entry Level",
    junior: "Junior",
    mid: "Mid Level",
    senior: "Senior",
    lead: "Lead",
    manager: "Manager",
    director: "Director",
  };
  return levelMap[level?.toLowerCase()] || level;
}

