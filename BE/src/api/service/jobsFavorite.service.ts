// src/api/service/job.service.ts

import JobListing from "../models/jobListing.model";
import FavoriteJob from "../models/favoriteJob.model";

/**
 * Toggle favorite job (add/remove)
 */
const toggleFavorite = async (userId: string, jobId: string) => {
  // Kiểm tra xem job đã được user thích chưa
  const existed = await FavoriteJob.findOne({ userId, jobId });

  // Nếu đã tồn tại → remove (bỏ yêu thích)
  if (existed) {
    await FavoriteJob.findByIdAndDelete(existed._id);
    return {
      message: "Removed from favorites",
      isFavorite: false,
      jobId
    };
  }

  // Nếu chưa → thêm mới
  await FavoriteJob.create({ userId, jobId });

  return {
    message: "Added to favorites",
    isFavorite: true,
    jobId
  };
};

/**
 * Get job list with isFavorite flag
 */
const getJobsForUser = async (userId: string) => {
  // Lấy toàn bộ job đã được duyệt + đang active
  const jobs = await JobListing.find({
    approvalStatus: "approved",
    status: "active",
  })
    .populate("companyId", "name logo")
    .populate("locationId", "location")
    .populate("jobTypeId", "name")
    .populate("jobDescriptionId")
    .lean();

  // Lấy danh sách job mà user đã yêu thích
  const favorites = await FavoriteJob.find({ userId });
  const favoriteJobIds = new Set(favorites.map(f => f.jobId.toString()));

  // Thêm isFavorite + id
  return jobs.map(job => ({
    ...job,
    id: job._id.toString(),
    isFavorite: favoriteJobIds.has(job._id.toString())
  }));
};

/**
 * Get detail job + isFavorite
 */
const getJobDetail = async (userId: string, jobId: string) => {
  const job = await JobListing.findById(jobId)
    .populate("companyId", "name logo")
    .populate("locationId", "location")
    .populate("jobTypeId", "name")
    .populate("jobDescriptionId")
    .lean();

  if (!job) return null;

  // Kiểm tra user có thích job này không
  const isFavorite = await FavoriteJob.exists({ userId, jobId });

  return {
    ...job,
    id: job._id.toString(),
    isFavorite: !!isFavorite
  };
};

// Export object để dùng kiểu: import * as jobService from ...
const jobService = {
  toggleFavorite,
  getJobsForUser,
  getJobDetail
};

export default jobService;
