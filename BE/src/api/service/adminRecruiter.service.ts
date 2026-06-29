// @ts-nocheck
import User from "../models/user.model";
import ActivationToken from "../models/activationToken.model";
import Company from "../models/company.model";
import { WalletModel } from "../models/wallet.model";
import { AccountStatus } from "../models/enum/accountStatus.enum";
import { UserRole } from "../models/enum/userRole.enum";
import { GetPendingRecruitersDTO } from "../dto/recruiter/adminRecruiter.dto";
import crypto from "crypto";
import { sendActivationEmail, sendRejectionEmail } from "./email.service";

/**
 * ==============================================
 * ADMIN RECRUITER MANAGEMENT SERVICE
 * ==============================================
 * Xử lý các nghiệp vụ admin quản lý recruiter:
 * - Xem danh sách recruiter chờ duyệt
 * - Duyệt recruiter (gửi email kích hoạt)
 * - Từ chối recruiter (gửi email thông báo)
 * - Kích hoạt tài khoản qua token
 */

// ============== HELPER FUNCTIONS ==============

/**
 * Generate activation token (32 bytes hex)
 */
const generateActivationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Calculate token expiry time (30 minutes from now)
 */
const getTokenExpiryTime = (): Date => {
  const expiryTime = new Date();
  expiryTime.setMinutes(expiryTime.getMinutes() + 30);
  return expiryTime;
};

/**
 * Get recruiter with company info
 */
const getRecruiterWithCompany = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("Không tìm thấy recruiter");
  }

  let company = null;
  if (user.companyId) {
    company = await Company.findById(user.companyId).lean();
  }

  return {
    ...user,
    company,
  };
};

// ============== GET RECRUITERS ==============

/**
 * Lấy danh sách tất cả recruiter (admin only)
 * Có thể filter theo accountStatus
 */
export const getAllRecruiters = async (dto: GetPendingRecruitersDTO) => {
  try {
    const { page, limit, sortBy, sortOrder } = dto;
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Query all recruiters
    const query = { role: UserRole.RECRUITER };

    const [recruiters, total] = await Promise.all([
      User.find(query)
        .populate("companyId", "name logo website")
        .populate("reviewedBy", "firstName lastName email")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      success: true,
      data: recruiters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh sách recruiter chờ duyệt (accountStatus = pending)
 */
export const getPendingRecruiters = async (dto: GetPendingRecruitersDTO) => {
  try {
    const { page, limit, sortBy, sortOrder } = dto;
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Query pending recruiters
    const query = {
      role: UserRole.RECRUITER,
      accountStatus: AccountStatus.PENDING,
    };

    const [recruiters, total] = await Promise.all([
      User.find(query)
        .populate("companyId", "name logo website")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      success: true,
      data: recruiters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy chi tiết một recruiter
 */
export const getRecruiterDetail = async (recruiterId: string) => {
  try {
    const recruiter = await getRecruiterWithCompany(recruiterId);

    if (recruiter.role !== UserRole.RECRUITER) {
      throw new Error("User không phải là recruiter");
    }

    return {
      success: true,
      data: recruiter,
    };
  } catch (error) {
    throw error;
  }
};

// ============== APPROVE RECRUITER ==============

/**
 * Admin duyệt recruiter
 * - Update accountStatus thành APPROVED
 * - Tạo activation token (hết hạn sau 30 phút)
 * - Gửi email chứa link kích hoạt
 */
export const approveRecruiter = async (
  recruiterId: string,
  adminId: string
) => {
  try {
    // 1. Tìm recruiter
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw new Error("Không tìm thấy recruiter");
    }

    if (recruiter.role !== UserRole.RECRUITER) {
      throw new Error("User không phải là recruiter");
    }

    if (recruiter.accountStatus !== AccountStatus.PENDING) {
      throw new Error(
        `Recruiter đã được xử lý với trạng thái: ${recruiter.accountStatus}`
      );
    }

    // 2. Update recruiter status thành APPROVED
    recruiter.accountStatus = AccountStatus.APPROVED;
    recruiter.reviewedAt = new Date();
    recruiter.reviewedBy = adminId;
    await recruiter.save();

    // 3. Tự động tạo wallet cho recruiter (nếu chưa có)
    const existingWallet = await WalletModel.findOne({ recruiterId });
    if (!existingWallet) {
      await WalletModel.create({
        recruiterId,
        balance: 0,
      });
    }

    // 4. Xóa các activation token cũ (nếu có)
    await ActivationToken.deleteMany({ userId: recruiterId });

    // 5. Tạo activation token mới
    const token = generateActivationToken();
    const expiresAt = getTokenExpiryTime();

    const activationToken = new ActivationToken({
      userId: recruiterId,
      token,
      expiresAt,
      isUsed: false,
    });

    await activationToken.save();

    // 6. Gửi email kích hoạt
    const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim();
    await sendActivationEmail(recruiter.email, fullName, token);

    return {
      success: true,
      message: "Duyệt recruiter thành công. Email kích hoạt đã được gửi.",
      data: {
        recruiterId: recruiter._id,
        email: recruiter.email,
        accountStatus: recruiter.accountStatus,
        tokenExpiresAt: expiresAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

// ============== REJECT RECRUITER ==============

/**
 * Admin từ chối recruiter
 * - Update accountStatus thành REJECTED
 * - Lưu lý do từ chối
 * - Gửi email thông báo
 */
export const rejectRecruiter = async (
  recruiterId: string,
  rejectionReason: string,
  adminId: string
) => {
  try {
    // 1. Tìm recruiter
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw new Error("Không tìm thấy recruiter");
    }

    if (recruiter.role !== UserRole.RECRUITER) {
      throw new Error("User không phải là recruiter");
    }

    if (recruiter.accountStatus !== AccountStatus.PENDING) {
      throw new Error(
        `Recruiter đã được xử lý với trạng thái: ${recruiter.accountStatus}`
      );
    }

    // 2. Update recruiter status thành REJECTED
    recruiter.accountStatus = AccountStatus.REJECTED;
    recruiter.rejectionReason = rejectionReason;
    recruiter.reviewedAt = new Date();
    recruiter.reviewedBy = adminId;
    recruiter.isActive = false; // Vô hiệu hóa tài khoản
    await recruiter.save();

    // 3. Gửi email thông báo từ chối
    const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim();
    await sendRejectionEmail(recruiter.email, fullName, rejectionReason);

    return {
      success: true,
      message: "Từ chối recruiter thành công. Email thông báo đã được gửi.",
      data: {
        recruiterId: recruiter._id,
        email: recruiter.email,
        accountStatus: recruiter.accountStatus,
        rejectionReason: recruiter.rejectionReason,
      },
    };
  } catch (error) {
    throw error;
  }
};

// ============== ACTIVATE ACCOUNT ==============

/**
 * Kích hoạt tài khoản recruiter qua activation token
 * - Kiểm tra token hợp lệ và chưa hết hạn
 * - Update accountStatus thành ACTIVE
 * - Đánh dấu token đã sử dụng
 */
export const activateRecruiterAccount = async (token: string) => {
  try {
    // 1. Tìm activation token
    const activationToken = await ActivationToken.findOne({ token });

    if (!activationToken) {
      throw new Error("Token kích hoạt không hợp lệ");
    }

    // 2. Kiểm tra token đã được sử dụng chưa
    if (activationToken.isUsed) {
      throw new Error("Token đã được sử dụng");
    }

    // 3. Kiểm tra token hết hạn chưa
    if (new Date() > activationToken.expiresAt) {
      throw new Error(
        "Token đã hết hạn. Vui lòng liên hệ admin để được cấp token mới."
      );
    }

    // 4. Tìm user
    const user = await User.findById(activationToken.userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // 5. Kiểm tra user đã được approve chưa
    if (user.accountStatus !== AccountStatus.APPROVED) {
      throw new Error(
        `Tài khoản không ở trạng thái chờ kích hoạt. Trạng thái hiện tại: ${user.accountStatus}`
      );
    }

    // 6. Kích hoạt tài khoản
    user.accountStatus = AccountStatus.ACTIVE;
    user.isActive = true;
    await user.save();

    // 7. Đánh dấu token đã sử dụng
    activationToken.isUsed = true;
    await activationToken.save();

    return {
      success: true,
      message: "Kích hoạt tài khoản thành công. Bạn có thể đăng nhập ngay bây giờ.",
      data: {
        userId: user._id,
        email: user.email,
        accountStatus: user.accountStatus,
      },
    };
  } catch (error) {
    throw error;
  }
};

// ============== RESEND ACTIVATION EMAIL ==============

/**
 * Gửi lại email kích hoạt cho recruiter đã được approve
 * Tạo token mới với thời hạn 30 phút
 */
export const resendActivationEmail = async (recruiterId: string) => {
  try {
    // 1. Tìm recruiter
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) {
      throw new Error("Không tìm thấy recruiter");
    }

    if (recruiter.role !== UserRole.RECRUITER) {
      throw new Error("User không phải là recruiter");
    }

    if (recruiter.accountStatus !== AccountStatus.APPROVED) {
      throw new Error(
        "Chỉ có thể gửi lại email cho recruiter đã được duyệt nhưng chưa kích hoạt"
      );
    }

    // 2. Xóa các token cũ
    await ActivationToken.deleteMany({ userId: recruiterId });

    // 3. Tạo token mới
    const token = generateActivationToken();
    const expiresAt = getTokenExpiryTime();

    const activationToken = new ActivationToken({
      userId: recruiterId,
      token,
      expiresAt,
      isUsed: false,
    });

    await activationToken.save();

    // 4. Gửi email
    const fullName = `${recruiter.firstName} ${recruiter.lastName}`.trim();
    await sendActivationEmail(recruiter.email, fullName, token);

    return {
      success: true,
      message: "Email kích hoạt đã được gửi lại",
      data: {
        email: recruiter.email,
        tokenExpiresAt: expiresAt,
      },
    };
  } catch (error) {
    throw error;
  }
};
