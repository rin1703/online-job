// @ts-nocheck
import Report from "../models/report.model";
import User from "../models/user.model";
import JobListingModel from "../models/jobListing.model";
import mongoose from "mongoose";
import { sendReportNotification, sendReportResolutionNotification } from "./notification.service";

/**
 * ========== REPORT SERVICE ==========
 * Xử lý báo cáo vi phạm từ JobSeeker/Recruiter
 * Tạo, cập nhật, xóa báo cáo
 */

// ============== HELPER FUNCTIONS ==============

/**
 * Helper: Lấy thông tin job và company
 */
const getJobDetails = async (jobId: string): Promise<{ jobTitle: string; companyName: string } | null> => {
  try {
    const job = await JobListingModel.findById(jobId)
      .populate({
        path: "companyId",
        select: "name",
      })
      .select("title companyId")
      .lean();

    if (!job) return null;

    return {
      jobTitle: (job as any).title || "Unknown Job",
      companyName: (job as any).companyId?.name || "Unknown Company",
    };
  } catch (error) {
    console.error("Error fetching job details:", error);
    return null;
  }
};

/**
 * Helper: Enrich job reports với thông tin job/company
 */
const enrichJobReports = async (reports: any[]): Promise<void> => {
  // Lấy tất cả jobIds cần populate
  const jobIds = reports
    .filter((r) => r.reportType === "job" && r.reported?.jobId && !r.reported?.name)
    .map((r) => r.reported.jobId);

  if (jobIds.length === 0) return;

  // Fetch tất cả jobs trong 1 query thay vì N queries
  const jobs = await JobListingModel.find({ _id: { $in: jobIds } })
    .populate({ path: "companyId", select: "name" })
    .select("title companyId")
    .lean();

  // Map jobId -> job details
  const jobMap = new Map(
    jobs.map((job: any) => [
      job._id.toString(),
      {
        title: job.title || "Unknown Job",
        companyName: job.companyId?.name || "Unknown Company",
      },
    ])
  );

  // Enrich reports
  for (const report of reports) {
    if (report.reportType === "job" && report.reported?.jobId && !report.reported?.name) {
      const jobDetails = jobMap.get(report.reported.jobId.toString());
      if (jobDetails) {
        report.reported.name = jobDetails.title;
        report.reported.email = jobDetails.companyName;
      }
    }
  }
};

// ============== CREATE REPORT ==============

/**
 * Tạo báo cáo job từ JobSeeker
 */
export const createJobReport = async (data: {
  jobId: string;
  reporterId: string;
  reason: string;
  description: string;
  evidence?: string[];
}): Promise<any> => {
  try {
    const reporter = await User.findById(data.reporterId);
    if (!reporter) {
      throw new Error("Không tìm thấy người báo cáo");
    }

    // ✅ Fetch job details để lưu vào report (tránh mất dữ liệu khi job bị xóa)
    const jobDetails = await getJobDetails(data.jobId);
    if (!jobDetails) {
      throw new Error(`Không tìm thấy job với ID ${data.jobId}. Vui lòng kiểm tra lại.`);
    }

    const report = new Report({
      reportType: "job",
      reporter: {
        userId: data.reporterId,
        role: (reporter as any).role,
        email: (reporter as any).email,
        name: (reporter as any).firstName + " " + (reporter as any).lastName,
      },
      reported: {
        jobId: data.jobId,
        name: jobDetails.jobTitle,
        email: jobDetails.companyName, // Sử dụng field email để lưu company name (để tương thích với schema hiện tại)
      },
      reason: data.reason,
      description: data.description,
      evidence: data.evidence,
      status: "pending",
    });

    const savedReport = await report.save();

    // Gửi notification cho admin
    await sendReportNotification(
      (reporter as any).firstName + " " + (reporter as any).lastName,
      "job",
      data.reason,
      data.description
    );

    return savedReport;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo báo cáo user từ Recruiter
 */
export const createUserReport = async (data: {
  userId: string;
  reporterId: string;
  reason: string;
  description: string;
  evidence?: string[];
}): Promise<any> => {
  try {
    const reporter = await User.findById(data.reporterId);
    const reported = await User.findById(data.userId);

    if (!reporter || !reported) {
      throw new Error("Không tìm thấy người báo cáo hoặc người bị báo cáo");
    }

    const report = new Report({
      reportType: "user",
      reporter: {
        userId: data.reporterId,
        role: (reporter as any).role,
        email: (reporter as any).email,
        name: (reporter as any).firstName + " " + (reporter as any).lastName,
      },
      reported: {
        userId: data.userId,
        email: (reported as any).email,
        name: (reported as any).firstName + " " + (reported as any).lastName,
      },
      reason: data.reason,
      description: data.description,
      evidence: data.evidence,
      status: "pending",
    });

    const savedReport = await report.save();

    // Gửi notification cho admin
    await sendReportNotification(
      (reporter as any).firstName + " " + (reporter as any).lastName,
      "user",
      data.reason,
      data.description
    );

    return savedReport;
  } catch (error) {
    throw error;
  }
};

// ============== GET REPORTS ==============

/**
 * Lấy danh sách tất cả báo cáo (chỉ Admin)
 */
export const getAllReports = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  reports: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const query: any = {};
    if (status) {
      (query as any).status = status;
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Sử dụng lean() để tăng performance

    // ✅ Enrich job reports với thông tin job/company (hỗ trợ backward compatibility)
    await enrichJobReports(reports);

    const total = await Report.countDocuments(query);

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết 1 báo cáo
 */
export const getReportById = async (reportId: string): Promise<any | null> => {
  try {
    const report = await Report.findById(reportId).lean();
    
    if (!report) return null;

    // ✅ Enrich job report nếu thiếu thông tin (hỗ trợ backward compatibility)
    if (report.reportType === "job" && report.reported?.jobId && !report.reported?.name) {
      const jobDetails = await getJobDetails(report.reported.jobId.toString());
      if (jobDetails) {
        report.reported.name = jobDetails.jobTitle;
        report.reported.email = jobDetails.companyName;
      }
    }

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy báo cáo của 1 user
 */
export const getReportsByReporter = async (
  reporterId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  reports: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const skip = (page - 1) * limit;
    const reporterObjectId = new mongoose.Types.ObjectId(reporterId);

    const reports = await Report.find({
      "reporter.userId": reporterObjectId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Sử dụng lean() để tăng performance

    // ✅ Enrich job reports với thông tin job/company (hỗ trợ backward compatibility)
    await enrichJobReports(reports);

    const total = await Report.countDocuments({
      "reporter.userId": reporterObjectId,
    });

    return {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

// ============== UPDATE REPORT ==============

/**
 * Cập nhật trạng thái báo cáo (Admin xử lý)
 */
export const updateReportStatus = async (
  reportId: string,
  status: "pending" | "reviewing" | "resolved" | "rejected",
  adminId: string,
  adminNote?: string
): Promise<any | null> => {
  try {
    const report = await Report.findByIdAndUpdate(
      reportId,
      {
        status,
        adminNote,
        resolvedBy: adminId,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
      { new: true }
    );

    // ✅ Gửi notification cho người báo cáo khi admin xử lý
    if (report) {
      await sendReportResolutionNotification(
        report.reporter.userId.toString(),
        report.reporter.email,
        report.reporter.role,
        report.reportType,
        status,
        adminNote,
        reportId
      );
    }

    return report;
  } catch (error) {
    throw error;
  }
};

// ============== DELETE REPORT ==============

/**
 * Xóa báo cáo (thường không xóa, chỉ thay đổi status)
 * Nhưng có thể xóa nếu là duplicate hoặc lỗi
 */
export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    const result = await Report.findByIdAndDelete(reportId);
    return result ? true : false;
  } catch (error) {
    throw error;
  }
};

// ============== STATISTICS ==============

/**
 * Lấy thống kê báo cáo
 */
export const getReportStatistics = async (): Promise<{
  total: number;
  pending: number;
  reviewing: number;
  resolved: number;
  rejected: number;
  jobReports: number;
  userReports: number;
}> => {
  try {
    const total = await Report.countDocuments();
    const pending = await Report.countDocuments({ status: "pending" });
    const reviewing = await Report.countDocuments({ status: "reviewing" });
    const resolved = await Report.countDocuments({ status: "resolved" });
    const rejected = await Report.countDocuments({ status: "rejected" });
    const jobReports = await Report.countDocuments({ reportType: "job" });
    const userReports = await Report.countDocuments({ reportType: "user" });

    return {
      total,
      pending,
      reviewing,
      resolved,
      rejected,
      jobReports,
      userReports,
    };
  } catch (error) {
    throw error;
  }
};


