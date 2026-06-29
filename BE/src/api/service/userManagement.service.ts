/**
 * ========== USER MANAGEMENT SERVICE ========== 
 * Tổng hợp các chức năng quản lý tài khoản người dùng: Ban/Unban, Soft Delete/Restore, Lấy danh sách
 */

import User from "../models/user.model";
import Application from "../models/application.model";
import Interview from "../models/interview.model";
import JobListingModel from "../models/jobListing.model";
import { PaymentModel } from "../models/payment.model";
import { GetUserAccountListDTO, UserAccountItemDTO, UserStatisticsDTO, UserStatusDTO } from "../dto/userAccountList.dto";
import { BanUserDTO, BanUserResponseDTO } from "../dto/banUser.dto";
import { DeleteUserDTO, DeleteUserResponseDTO } from "../dto/softDeleteUser.dto";
import { BanDuration, getBanDurationInMilliseconds, getBanDurationLabel } from "../models/enum/banDuration.enum";
import { validatePaginationParams, calculateTotalPages } from "../../helper/pagination.helper";
import { Types } from "mongoose";
import { UserRole } from "../models/enum/userRole.enum";

/**
 * Ban tài khoản người dùng có thời hạn
 */
export const banUserService = async (
  userId: string,
  dto: BanUserDTO,
  adminId: string
): Promise<BanUserResponseDTO> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }
    const user = await User.findById(userId) as any;
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (user.role === "admin") throw new Error("Không thể ban tài khoản admin");
    if (user._id.toString() === adminId) throw new Error("Không thể ban chính tài khoản của bạn");
    const banDurationMs = getBanDurationInMilliseconds(dto.duration);
    const bannedUntil = new Date(Date.now() + banDurationMs);
    user.lockUntil = bannedUntil;
    user.loginAttempts = 0;
    await user.save();
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const banDurationLabel = getBanDurationLabel(dto.duration);
    return {
      success: true,
      message: `Đã ban tài khoản ${fullName} (${user.email}) trong ${banDurationLabel}`,
      data: {
        userId: user._id.toString(),
        email: user.email,
        fullName,
        bannedUntil,
        banDuration: dto.duration,
        banDurationLabel,
        reason: dto.reason,
        bannedBy: adminId,
        bannedAt: new Date(),
      },
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi ban tài khoản: ${error.message}`);
  }
};

/**
 * Unban tài khoản người dùng (gỡ ban)
 */
export const unbanUserService = async (
  userId: string,
  adminId: string
): Promise<{ success: boolean; message: string; data: { userId: string; email: string; fullName: string } }> => {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new Error("ID người dùng không hợp lệ");
    const user = await User.findById(userId) as any;
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (!user.lockUntil || new Date(user.lockUntil) <= new Date()) throw new Error("Tài khoản này không đang bị ban");
    user.lockUntil = null;
    user.loginAttempts = 0;
    await user.save();
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return {
      success: true,
      message: `Đã gỡ ban tài khoản ${fullName} (${user.email})`,
      data: {
        userId: user._id.toString(),
        email: user.email,
        fullName,
      },
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi gỡ ban tài khoản: ${error.message}`);
  }
};

/**
 * Soft delete tài khoản người dùng
 */
export const deleteUserService = async (
  userId: string,
  dto: DeleteUserDTO,
  adminId: string
): Promise<DeleteUserResponseDTO> => {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new Error("ID người dùng không hợp lệ");
    const user = await User.findById(userId) as any;
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (user.isDeleted) throw new Error("Tài khoản này đã bị xóa");
    if (user.role === "admin") throw new Error("Không thể xóa tài khoản admin");
    if (user._id.toString() === adminId) throw new Error("Không thể xóa chính tài khoản của bạn");
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.deletedBy = new Types.ObjectId(adminId);
    user.deleteReason = dto.reason || null;
    user.isActive = false;
    await user.save();
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return {
      success: true,
      message: `Đã xóa tài khoản ${fullName} (${user.email})`,
      data: {
        userId: user._id.toString(),
        email: user.email,
        fullName,
        deletedAt: user.deletedAt,
        deletedBy: adminId,
        reason: dto.reason,
      },
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi xóa tài khoản: ${error.message}`);
  }
};

/**
 * Restore tài khoản người dùng (khôi phục từ soft delete)
 */
export const restoreUserService = async (
  userId: string,
  adminId: string
): Promise<{ success: boolean; message: string; data: { userId: string; email: string; fullName: string } }> => {
  try {
    if (!Types.ObjectId.isValid(userId)) throw new Error("ID người dùng không hợp lệ");
    const user = await User.findById(userId) as any;
    if (!user) throw new Error("Không tìm thấy người dùng");
    if (!user.isDeleted) throw new Error("Tài khoản này không đang bị xóa");
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
    user.deleteReason = null;
    user.isActive = true;
    await user.save();
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    return {
      success: true,
      message: `Đã khôi phục tài khoản ${fullName} (${user.email})`,
      data: {
        userId: user._id.toString(),
        email: user.email,
        fullName,
      },
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi khôi phục tài khoản: ${error.message}`);
  }
};

/**
 * Lấy danh sách tài khoản người dùng với filters, pagination và statistics
 */
export const getUserAccountListService = async (
  dto: GetUserAccountListDTO
): Promise<{
  success: boolean;
  message: string;
  data: UserAccountItemDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    applied: {
      role?: string;
      status?: string;
      search?: string;
      dateRange?: {
        from?: string;
        to?: string;
      };
    };
    available: {
      roles: string[];
      statuses: string[];
      dateRange: {
        from: string;
        to: string;
      };
    };
  };
}> => {
  try {
    const pagination = validatePaginationParams({ page: dto.page, limit: dto.limit });
    const queryFilter = buildUserQueryFilter(dto);
    const total = await User.countDocuments(queryFilter);
    const sortObject = buildSortObject(dto.sortBy, dto.sortOrder);
    const users = await User.find(queryFilter)
      .sort(sortObject)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();
    const usersWithStatistics = await Promise.all(
      users.map(async (user: any) => {
        const statistics = await calculateUserStatistics(user._id.toString(), user.role);
        const status = buildUserStatus(user);
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        return {
          _id: user._id.toString(),
          email: user.email,
          fullName,
          role: user.role,
          birthday: user.birthday,
          phone: user.phone,
          isActive: user.isActive,
          loginAttempts: user.loginAttempts || 0,
          lockUntil: user.lockUntil || null,
          companyId: user.companyId ? user.companyId.toString() : null,
          googleId: null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          statistics,
          status,
        } as UserAccountItemDTO;
      })
    );
    const filters = buildFiltersResponse(dto);
    let message = "Lấy danh sách người dùng thành công";
    if (dto.search && total === 0) {
      message = "Không thể lấy được danh sách người dùng như email bạn đã đưa vào";
    }
    return {
      success: true,
      message,
      data: usersWithStatistics,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: calculateTotalPages(total, pagination.limit),
      },
      filters,
    };
  } catch (error: any) {
    throw new Error(`Lỗi khi lấy danh sách người dùng: ${error.message}`);
  }
};

function buildUserQueryFilter(dto: GetUserAccountListDTO): any {
  const filter: any = {};
  filter.isDeleted = { $ne: true };
  if (dto.role) filter.role = dto.role;
  if (dto.status) {
    if (dto.status === "active") {
      filter.isActive = true;
      filter.$or = [
        { lockUntil: { $exists: false } },
        { lockUntil: null },
        { lockUntil: { $lt: new Date() } }
      ];
    } else if (dto.status === "inactive") {
      filter.isActive = false;
    } else if (dto.status === "locked") {
      filter.lockUntil = { $gt: new Date() };
    }
  }
  if (dto.search) {
    const escapedSearch = dto.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedSearch, "i");
    filter.email = searchRegex;
  }
  if (dto.dateFrom || dto.dateTo) {
    filter.createdAt = {};
    if (dto.dateFrom) filter.createdAt.$gte = new Date(dto.dateFrom);
    if (dto.dateTo) {
      const endDate = new Date(dto.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
  }
  return filter;
}

function buildSortObject(
  sortBy?: string,
  sortOrder?: string
): Record<string, 1 | -1> {
  const order = sortOrder === "asc" ? 1 : -1;
  switch (sortBy) {
    case "email":
      return { email: order };
    case "fullName":
      return { firstName: order, lastName: order };
    case "updatedAt":
      return { updatedAt: order };
    case "createdAt":
    default:
      return { createdAt: order };
  }
}

async function calculateUserStatistics(
  userId: string,
  role: string
): Promise<UserStatisticsDTO> {
  const userObjectId = new Types.ObjectId(userId);
  const statistics: UserStatisticsDTO = { lastActivity: null };
  try {
    if (role === UserRole.JOB_SEEKER) {
      const totalApplications = await Application.countDocuments({ jobSeekerId: userObjectId });
      statistics.totalApplications = totalApplications;
      const totalInterviews = await Interview.countDocuments({ jobSeekerId: userObjectId });
      statistics.totalInterviews = totalInterviews;
      const lastApplication = await Application.findOne({ jobSeekerId: userObjectId })
        .sort({ updatedAt: -1 })
        .select("updatedAt")
        .lean() as any;
      const lastInterview = await Interview.findOne({ jobSeekerId: userObjectId })
        .sort({ updatedAt: -1 })
        .select("updatedAt")
        .lean() as any;
      const activities = [lastApplication?.updatedAt, lastInterview?.updatedAt].filter(Boolean) as Date[];
      if (activities.length > 0) {
        statistics.lastActivity = new Date(Math.max(...activities.map((d) => d.getTime())));
      }
    } else if (role === UserRole.RECRUITER) {
      const totalJobPosts = await JobListingModel.countDocuments({ recruiterId: userObjectId, isDeleted: false });
      statistics.totalJobPosts = totalJobPosts;
      const totalPackages = await PaymentModel.countDocuments({ recruiterId: userObjectId, status: "paid" });
      statistics.totalPackages = totalPackages;
      const totalInterviews = await Interview.countDocuments({ recruiterId: userObjectId });
      statistics.totalInterviews = totalInterviews;
      const lastJobPost = await JobListingModel.findOne({ recruiterId: userObjectId })
        .sort({ updatedAt: -1 })
        .select("updatedAt")
        .lean() as any;
      const lastPayment = await PaymentModel.findOne({ recruiterId: userObjectId })
        .sort({ updatedAt: -1 })
        .select("updatedAt")
        .lean() as any;
      const lastInterview = await Interview.findOne({ recruiterId: userObjectId })
        .sort({ updatedAt: -1 })
        .select("updatedAt")
        .lean() as any;
      const activities = [lastJobPost?.updatedAt, lastPayment?.updatedAt, lastInterview?.updatedAt].filter(Boolean) as Date[];
      if (activities.length > 0) {
        statistics.lastActivity = new Date(Math.max(...activities.map((d) => d.getTime())));
      }
    }
  } catch (error) {
    console.error(`Error calculating statistics for user ${userId}:`, error);
  }
  return statistics;
}

function buildUserStatus(user: any): UserStatusDTO {
  const isLocked = user.lockUntil && new Date(user.lockUntil) > new Date();
  const isInactive = !user.isActive;
  const status: UserStatusDTO = {
    isActive: user.isActive,
    isLocked,
    isInactive,
    lastLogin: user.updatedAt || null,
  };
  if (isLocked) {
    status.lockReason = "Exceeded maximum login attempts";
    status.lockUntil = user.lockUntil;
  }
  if (isInactive) {
    status.inactiveReason = "Account deactivated by admin";
  }
  return status;
}

function buildFiltersResponse(dto: GetUserAccountListDTO): {
  applied: {
    role?: string;
    status?: string;
    search?: string;
    dateRange?: {
      from?: string;
      to?: string;
    };
  };
  available: {
    roles: string[];
    statuses: string[];
    dateRange: {
      from: string;
      to: string;
    };
  };
} {
  const applied: any = {};
  if (dto.role) applied.role = dto.role;
  if (dto.status) applied.status = dto.status;
  if (dto.search) applied.search = dto.search;
  if (dto.dateFrom || dto.dateTo) {
    applied.dateRange = {};
    if (dto.dateFrom) applied.dateRange.from = dto.dateFrom;
    if (dto.dateTo) applied.dateRange.to = dto.dateTo;
  }
  return {
    applied,
    available: {
      roles: Object.values(UserRole),
      statuses: ["active", "inactive", "locked"],
      dateRange: {
        from: "2024-01-01",
        to: "2025-12-31",
      },
    },
  };
}
