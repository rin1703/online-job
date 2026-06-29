// @ts-nocheck
import Interview from "../models/interview.model";
import User from "../models/user.model";
import Application from "../models/application.model";
import JobListing from "../models/jobListing.model";
import mongoose from "mongoose";
import {
  sendInterviewInvitationNotification,
  sendInterviewUpdateNotification,
  sendInterviewResponseNotification,
} from "./notification.service";
import { InterviewStatus } from "../models/enum/interviewStatus.enum";
import {
  DEFAULT_VALUES,
} from "../../helper/constants.helper";

/**
 * ========== INTERVIEW SERVICE ==========
 * Xử lý lịch phỏng vấn và phản hồi từ JobSeeker
 */

// ============== HELPER FUNCTIONS ==============

/**
 * Lấy tên đầy đủ của user
 */
const getUserFullName = (user: any): string => {
  return `${(user as any).firstName} ${(user as any).lastName}`;
};

/**
 * Lấy job title từ application
 */
const getJobTitleFromApplication = async (applicationId: string): Promise<string> => {
  try {
    const application = await Application.findById(applicationId);
    if (!application) return "Unknown Position";

    const jobListing = await JobListing.findById((application as any).jobId);
    return jobListing ? (jobListing as any).title : "Unknown Position";
  } catch (error) {    return "Unknown Position";
  }
};

/**
 * Cập nhật interview status dựa trên response
 */
const updateInterviewStatus = (accepted: boolean): InterviewStatus => {
  return accepted ? InterviewStatus.ACCEPTED : InterviewStatus.REJECTED;
};

// ============== CREATE INTERVIEW ==============

/**
 * Tạo lịch phỏng vấn từ Recruiter
 */
export const createInterview = async (data: {
  jobId: string;
  applicationId: string;
  recruiterId: string;
  jobSeekerId: string;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  location?: string;
  meetingLink?: string;
  note?: string;
}): Promise<any> => {
  try {
    const interview = new Interview({
      jobId: data.jobId,
      applicationId: data.applicationId,
      recruiterId: data.recruiterId,
      jobSeekerId: data.jobSeekerId,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      duration: data.duration,
      location: data.location,
      meetingLink: data.meetingLink,
      note: data.note,
      status: "pending",
    });

    const savedInterview = await interview.save();

    // ✅ Cập nhật application status sang "interview_scheduled"
    await Application.findByIdAndUpdate(
      data.applicationId,
      { status: "interview_scheduled" },
      { new: true }
    );

    return savedInterview;
  } catch (error) {
    throw error;
  }
};

// ============== GET INTERVIEWS ==============

/**
 * Lấy lịch phỏng vấn của JobSeeker
 */
export const getInterviewsForJobSeeker = async (
  jobSeekerId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  interviews: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const jobSeekerObjectId = new mongoose.Types.ObjectId(jobSeekerId);
    const query: any = { jobSeekerId: jobSeekerObjectId };
    if (status) {
      (query as any).status = status;
    }

    const skip = (page - 1) * limit;

    const interviews = await Interview.find(query)
      .populate("recruiterId", "firstName lastName email")
      .populate("jobId", "title")
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments(query);

    return {
      interviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy lịch phỏng vấn của Recruiter
 */
export const getInterviewsForRecruiter = async (
  recruiterId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  interviews: any[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  try {
    const recruiterObjectId = new mongoose.Types.ObjectId(recruiterId);
    const query: any = { recruiterId: recruiterObjectId };
    if (status) {
      (query as any).status = status;
    }

    const skip = (page - 1) * limit;

    const interviews = await Interview.find(query)
      .populate("jobSeekerId", "firstName lastName email")
      .populate("jobId", "title")
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Interview.countDocuments(query);

    return {
      interviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết 1 lịch phỏng vấn
 */
export const getInterviewById = async (
  interviewId: string
): Promise<any | null> => {
  try {
    const interview = await Interview.findById(interviewId)
      .populate("jobSeekerId", "firstName lastName email")
      .populate("recruiterId", "firstName lastName email")
      .populate("jobId", "title");
    return interview;
  } catch (error) {
    throw error;
  }
};

// ============== UPDATE INTERVIEW ==============

/**
 * Phản hồi lịch phỏng vấn từ JobSeeker
 */
export const respondToInterview = async (
  interviewId: string,
  accepted: boolean,
  rejectionReason?: string
): Promise<any | null> => {
  try {
    // Step 1: Find interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new Error("Không tìm thấy lịch phỏng vấn");
    }

    // Step 2: Update interview status and response
    (interview as any).status = updateInterviewStatus(accepted);
    interview.jobSeekerResponse = {
      accepted,
      respondedAt: new Date(),
      rejectionReason,
    };

    const savedInterview = await interview.save();

    // Step 3: Send notification to recruiter
    const jobSeeker = await User.findById(interview.jobSeekerId);
    if (!jobSeeker) return savedInterview;

    const recruiter = await User.findById(interview.recruiterId);
    if (!recruiter) return savedInterview;

    // Step 4: Get job title
    const jobTitle = await getJobTitleFromApplication(interview.applicationId.toString());

    // Step 5: Send notification
    const jobSeekerFullName = getUserFullName(jobSeeker);
    await sendInterviewResponseNotification(
      interview.recruiterId.toString(),
      interviewId,
      jobSeekerFullName,
      jobTitle,
      accepted,
      rejectionReason
    );

    return savedInterview;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật thông tin lịch phỏng vấn (ngày, giờ, địa điểm, link, ghi chú)
 */
export const updateInterview = async (
  interviewId: string,
  updateData: {
    scheduledDate?: Date;
    scheduledTime?: string;
    duration?: number;
    location?: string;
    meetingLink?: string;
    note?: string;
  },
  recruiterId: string
): Promise<any | null> => {
  try {
    // Step 1: Find interview
    const interview = await Interview.findById(interviewId)
      .populate("jobSeekerId", "firstName lastName email")
      .populate("jobId", "title")
      .populate("applicationId");
    
    if (!interview) {
      throw new Error("Không tìm thấy lịch phỏng vấn");
    }

    // Step 2: Check ownership
    if (interview.recruiterId.toString() !== recruiterId) {
      throw new Error("Bạn không có quyền cập nhật lịch phỏng vấn này");
    }

    // Step 3: Only allow update if pending or accepted
    if (interview.status !== "pending" && interview.status !== "accepted") {
      throw new Error(
        `Không thể cập nhật lịch phỏng vấn với trạng thái ${interview.status}`
      );
    }

    // Step 4: Update interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: updateData },
      { new: true }
    ).populate("jobSeekerId", "firstName lastName email")
     .populate("jobId", "title");

    // Step 5: Send notification to job seeker about the update
    const jobSeeker = await User.findById(interview.jobSeekerId._id);
    if (jobSeeker) {
      // Get company name from application
      const application = await Application.findById(interview.applicationId)
        .populate({
          path: "jobId",
          populate: { path: "companyId", select: "companyName" }
        });
      
      const companyName = application?.jobId?.companyId?.companyName || "Công ty";
      
      await sendInterviewUpdateNotification(
        interview.jobSeekerId._id.toString(),
        interviewId,
        interview.jobId?.title || "Vị trí tuyển dụng",
        companyName,
        updateData.scheduledDate || interview.scheduledDate,
        updateData.scheduledTime || interview.scheduledTime,
        updateData.location || interview.location || "",
        recruiterId,
        updateData.meetingLink || interview.meetingLink,
        updateData.note || interview.note
      );
    }

    return updatedInterview;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật kết quả phỏng vấn từ Recruiter
 */
export const updateInterviewResult = async (
  interviewId: string,
  passed: boolean,
  feedback: string
): Promise<any | null> => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      {
        status: "completed",
        result: {
          passed,
          feedback,
          evaluatedAt: new Date(),
        },
      },
      { new: true }
    );

    return interview;
  } catch (error) {
    throw error;
  }
};

/**
 * Hủy lịch phỏng vấn
 */
export const cancelInterview = async (
  interviewId: string,
  reason: string
): Promise<any | null> => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      {
        status: "cancelled",
        note: `Hủy: ${reason}`,
      },
      { new: true }
    );

    return interview;
  } catch (error) {
    throw error;
  }
};

// ============== DELETE INTERVIEW ==============

/**
 * Xóa lịch phỏng vấn (thường không xóa)
 */
export const deleteInterview = async (interviewId: string): Promise<boolean> => {
  try {
    const result = await Interview.findByIdAndDelete(interviewId);
    return result ? true : false;
  } catch (error) {
    throw error;
  }
};

// ============== STATISTICS ==============

/**
 * Lấy thống kê phỏng vấn
 */
export const getInterviewStatistics = async (): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  completed: number;
  cancelled: number;
}> => {
  try {
    const total = await Interview.countDocuments();
    const pending = await Interview.countDocuments({ status: "pending" });
    const accepted = await Interview.countDocuments({ status: "accepted" });
    const rejected = await Interview.countDocuments({ status: "rejected" });
    const completed = await Interview.countDocuments({ status: "completed" });
    const cancelled = await Interview.countDocuments({ status: "cancelled" });

    return {
      total,
      pending,
      accepted,
      rejected,
      completed,
      cancelled,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy upcoming interviews trong 7 ngày
 */
export const getUpcomingInterviews = async (): Promise<any[]> => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const interviews = await Interview.find({
      scheduledDate: {
        $gte: today,
        $lte: nextWeek,
      },
      status: { $in: ["pending", "accepted"] },
    }).sort({ scheduledDate: 1 });

    return interviews;
  } catch (error) {
    throw error;
  }
};


