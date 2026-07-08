import mongoose from "mongoose";
import { WalletModel } from "../models/wallet.model";
import { WalletTransactionModel } from "../models/walletTransaction.model";
import { checkReplicaSet } from "../../helper/database.helper";
import {
  RefundTransactionInternalDTO,
  CancelUnusedPackageDTO,
} from "../dto/payment/refund.dto";
import { SubscriptionModel } from "../models/subscription.model";
import RefundRequestModel from "../models/refund.model";
import { CreateRefundRequestDTO } from "../dto/payment/refundRecruiter.dto";
import {
  GetRefundRequestDTO,
  AdminApproveRefundDTO,
} from "../dto/payment/refund.dto";
import {
  validatePaginationParams,
  createPaginatedResponse,
} from "../../helper/pagination.helper";

export const coreRefundTransaction = async (
  dto: RefundTransactionInternalDTO
) => {
  const useTransaction = await checkReplicaSet();
  const session = useTransaction ? await mongoose.startSession() : null;
  if (session) {
    session.startTransaction();
  }

  try {
    const { recruiterId, amount, reference, description } = dto;

    const wallet = await WalletModel.findOne({ recruiterId }).session(session);
    if (!wallet) throw new Error("Wallet not found");

    // Cộng tiền lại ví
    wallet.balance += amount;
    await wallet.save(session ? { session } : undefined);

    // Ghi giao dịch
    await WalletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          type: "credit",
          amount,
          reference,
          description,
        },
      ],
      session ? { session } : undefined
    );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return { balance: wallet.balance, refunded: amount };
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    throw err;
  }
};

//createRefund Recruiter
export const createRefundRequestService = async (
  recruiterId: string,
  dto: CreateRefundRequestDTO
) => {
  const { reason, refundType, reference } = dto;

  if (!reason || reason.trim() === "") {
    throw new Error("Refund reason is required.");
  }

  if (!refundType || !["unused", "system"].includes(refundType)) {
    throw new Error("refundType must be either 'unused' or 'system'.");
  }

  // 1. Lấy subscription active gần nhất của recruiter
  const subscription = await SubscriptionModel.findOne({
    userId: recruiterId,
    status: "active",
    endDate: { $gt: new Date() },
  }).sort({ startDate: -1 });

  if (!subscription) {
    throw new Error("You have no active subscription eligible for refund.");
  }

  // 2. Nếu refundType = 'unused' → kiểm tra đã dùng hay chưa
  if (refundType === "unused") {
    const isUsed =
      subscription.firstUsageAt !== null || (subscription.usageCount ?? 0) > 0;

    if (isUsed) {
      throw new Error(
        "You cannot request an unused refund because the subscription has already been used."
      );
    }
  }

  // 3. Check trùng request
  const existingRequest = await RefundRequestModel.findOne({
    subscriptionId: subscription._id,
    status: { $in: ["pending", "processing"] },
  });

  if (existingRequest) {
    throw new Error(
      "A refund request for this subscription is already pending or being processed."
    );
  }

  // 4. Tạo request refund
  const request = await RefundRequestModel.create({
    recruiterId,
    subscriptionId: subscription._id,
    reason,
    refundType,
    reference: reference || `REF_${subscription._id}`,
    status: "pending",
  });

  return {
    ok: true,
    message: "Refund request created. Waiting for admin approval.",
    requestId: request._id.toString(),
  };
};

export const refundCancelUnusedPackage = async (
  recruiterId: string,
  dto: CancelUnusedPackageDTO
) => {
  const { reference, reason } = dto;

  // 1) Lấy subscription active và chưa sử dụng
  const sub = await SubscriptionModel.findOne({
    userId: recruiterId,
    status: "active",
    endDate: { $gt: new Date() },
    usageCount: { $lte: 0 }, // chưa dùng
  }).sort({ startDate: -1 });

  if (!sub) {
    throw new Error("No unused active subscription available for refund.");
  }

  // 2) Giá gói lấy từ snapshot
  const amount = sub.features?.price;
  if (!amount || amount <= 0) {
    throw new Error("Invalid subscription price.");
  }

  // 3) Refund vào ví
  const result = await coreRefundTransaction({
    recruiterId,
    amount,
    reference: reference || `REFUND_SUB_${sub._id}`,
    description: `Refund unused subscription | subId=${sub._id} | reason=${
      reason || "N/A"
    }`,
  });

  // 4) Update trạng thái subscription
  sub.status = "refunded";
  await sub.save();

  return {
    refundedAmount: amount,
    walletBalance: result.balance,
    subscriptionId: sub._id,
  };
};

export const adminApproveRefundRequest = async (
  adminId: string,
  requestId: string,
  dto: { action: "approve" | "reject"; notes?: string }
) => {
  const reqDoc = await RefundRequestModel.findById(requestId);
  if (!reqDoc) throw new Error("Refund request not found");

  if (reqDoc.status !== "pending") {
    throw new Error(`Request already in state: ${reqDoc.status}`);
  }

  const adminObjectId = new mongoose.Types.ObjectId(adminId);

  if (dto.action === "reject") {
    reqDoc.status = "rejected";
  } else if (dto.action === "approve") {
    reqDoc.status = "approved"; // ❗ Không refund ở đây nữa
  } else {
    throw new Error("Invalid action");
  }

  reqDoc.processedBy = adminObjectId;
  reqDoc.processedAt = new Date();
  reqDoc.notes = dto.notes || null;

  await reqDoc.save();

  return { ok: true, status: reqDoc.status };
};

export const adminProcessRefund = async (
  adminId: string,
  requestId: string
) => {
  const reqDoc = await RefundRequestModel.findById(requestId);
  if (!reqDoc) throw new Error("Refund request not found");

  if (reqDoc.status !== "approved") {
    throw new Error("Refund request must be approved first");
  }

  const adminObjectId = new mongoose.Types.ObjectId(adminId);

  let result;

  try {
    if (reqDoc.refundType === "unused") {
      result = await refundCancelUnusedPackage(reqDoc.recruiterId.toString(), {
        subscriptionId: reqDoc.subscriptionId.toString(),
        reference: reqDoc.reference,
        reason: reqDoc.reason,
      });
    } else if (reqDoc.refundType === "system") {
      result = await adminSystemRefund(
        adminObjectId.toString(),
        reqDoc.subscriptionId.toString(),
        {
          reference: reqDoc.reference,
          reason: reqDoc.reason,
        }
      );
    } else {
      throw new Error("Unknown refund type");
    }

    reqDoc.status = "processed";
    reqDoc.notes = `Refunded amount: ${result.refunded}`;
    reqDoc.processedBy = adminObjectId;
    reqDoc.processedAt = new Date();
    await reqDoc.save();

    return { ok: true, ...result };
  } catch (err: any) {
    reqDoc.status = "failed";
    reqDoc.processedBy = adminObjectId;
    reqDoc.processedAt = new Date();
    reqDoc.notes = `Failed: ${err.message}`;
    await reqDoc.save();

    throw new Error(`Refund failed: ${err.message}`);
  }
};

export const getRefundRequestsService = async (
  recruiterId: string,
  dto: GetRefundRequestDTO
) => {
  // Validate and normalize pagination params
  const { page, limit, skip } = validatePaginationParams({
    page: Number(dto.page),
    limit: Number(dto.limit),
  });

  // Validate status
  const validStatuses = ["pending", "processed", "rejected", "failed"];
  let status: string | undefined = dto.status;
  if (status) {
    status = status.toLowerCase();
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status provided for filter (400)");
    }
  }

  // Build query
  const query: any = { recruiterId };
  if (status) query.status = status;

  // Count total
  const totalItems = await RefundRequestModel.countDocuments(query);
  // Fetch page
  const docs = await RefundRequestModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Build response
  return {
    ok: true,
    ...createPaginatedResponse(docs, totalItems, page, limit),
  };
};

export const adminGetAllRefundRequestsService = async (
  dto: GetRefundRequestDTO
) => {
  const { page, limit, skip } = validatePaginationParams({
    page: Number(dto.page),
    limit: Number(dto.limit),
  });

  // Cho phép filter status
  const validStatuses = ["pending", "approved", "rejected"];
  let status: string | undefined = dto.status;
  if (status) {
    status = status.toLowerCase();
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid status provided for filter (400)");
    }
  }

  // Build query
  const query: any = {};
  if (status) query.status = status;

  // Count
  const totalItems = await RefundRequestModel.countDocuments(query);

  // Fetch
  const docs = await RefundRequestModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({ path: "recruiterId", select: "firstName lastName email" })
    .populate({
      path: "subscriptionId",
      select: "packageId",
      populate: { path: "packageId", select: "name price" },
    })
    .lean();
  // MAP dữ liệu cho FE
  const mapped = docs.map((d: any) => {
    const recruiter = d.recruiterId || null;
    const subscription = d.subscriptionId || null;
    const packageInfo = subscription?.packageId || null;

    const recruiterName = recruiter
      ? `${recruiter.firstName || ""} ${recruiter.lastName || ""}`.trim()
      : null;

    return {
      id: d._id,
      recruiter: {
        id: recruiter?._id ?? null,
        name: recruiterName,
        email: recruiter?.email ?? null,
      },

      // LẤY ĐÚNG GÓI ĐANG DÙNG
      package: packageInfo?.name ?? null,

      // LẤY GIÁ TỪ SUBSCRIPTION PACKAGE
      amount: packageInfo?.price ?? null,
      reason: d.reason,
      refundType: d.refundType,
      status: d.status,
    };
  });

  return {
    ok: true,
    ...createPaginatedResponse(mapped, totalItems, page, limit),
  };
};
export const adminSystemRefund = async (
  adminId: string,
  subscriptionId: string,
  dto: { reference?: string; reason?: string }
) => {
  const sub = await SubscriptionModel.findById(subscriptionId);
  if (!sub) throw new Error("Subscription not found");

  // Lấy giá gói từ snapshot
  const amount = sub.features?.price;
  if (!amount || amount < 1) throw new Error("Invalid subscription price");

  // Hoàn tiền vào ví user
  const result = await coreRefundTransaction({
    recruiterId: sub.userId.toString(),
    amount: amount,
    reference: dto.reference || `system_refund_${subscriptionId}`,
    description: `System refund triggered by admin | reason=${
      dto.reason || "system"
    }`,
  });

  return {
    refunded: amount,
    walletBalance: result.balance,
    subscriptionId,
  };
};
