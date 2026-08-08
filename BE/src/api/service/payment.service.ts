// src/api/services/payment.service.ts
import { payos } from "../../config/payment.config";
import { PaymentModel } from "../models/payment.model";
import { PayOSWebhookDTO } from "../dto/payment/paymentWebHook.dto";
import { CreateWalletTopupDTO } from "../dto/payment/createWalletTopup.dto";
import { JobPackageModel } from "../models/jobPackage.model";
// import { activateJobPackage } from "./jobPackage.service";
import { CreatePaymentDTO } from "../dto/payment/createPayment.dto";
import {
  generateOrderCode,
  generatePublicCode,
} from "../../helper/generateCode.help";
import mongoose from "mongoose";
import SubscriptionPackage from "../models/subscriptionPackage.model";
import { SubscriptionModel } from "../models/subscription.model";
import { calculateEndDate, limitDescription } from "../../helper/payment.help";
import { RefundRequestDTO } from "../dto/payment/refundPayment.dto";
import { RefundResponseDTO } from "../dto/payment/refundPayment.dto";
import { WalletModel } from "../models/wallet.model";
export const confirmWebhook = async () => {
  const url = process.env.WEBHOOK_PUBLIC_URL!;
  console.log("Confirming webhook URL:", url);

  try {
    const result = await payos.webhooks.confirm(url);
    console.log("Webhook confirmed:", result);
  } catch (err: any) {
    console.error("Webhook confirmation failed:", err.message);
  }
};

export const createPayment = async (
  dto: CreatePaymentDTO,
  recruiterId: string
) => {
  // 1. Check package tồn tại
  const subscriptionPackage = await SubscriptionPackage.findById(
    dto.jobPackageId
  );
  if (!subscriptionPackage || !subscriptionPackage.isActive) {
    throw new Error("Subscription package not found or inactive");
  }

  const packagePrice = subscriptionPackage.price;

  // 2. Lấy wallet của user
  const wallet = await WalletModel.findOne({ recruiterId });
  if (!wallet) throw new Error("Wallet not found");

  const currentBalance = wallet.balance || 0;

  // 3. Tính số tiền cần nạp thêm
  const amountToPay = Math.max(packagePrice - currentBalance, 0);

  // Nếu amountToPay <= 0 → user dư tiền, không cần tạo QR
  if (amountToPay <= 0) {
    return {
      ok: true,
      canProceedWithoutPayment: true,
      message: "You have enough wallet balance. No payment needed.",
      balance: currentBalance,
      requiredAmount: packagePrice,
    };
  }

  // 4. Prepare description
  let description = `Payment ${subscriptionPackage.name}`;
  description = limitDescription(description, 25);

  // 5. Create PayOS order
  const orderCode = generateOrderCode();
  const publicCode = generatePublicCode(orderCode);

  const corsOrigin = process.env.CORS_ORIGINS || "http://localhost:3000";
  const payosResult = await payos.paymentRequests.create({
    orderCode,
    amount: amountToPay,
    description,
    returnUrl: `${corsOrigin}/payment-success`,
    cancelUrl: `${corsOrigin}/payment-failure`,
  });

  // 6. Lưu Payment vào DB
  const payment = await PaymentModel.create({
    orderCode: orderCode.toString(),
    publicCode,
    recruiterId,
    jobPackageId: dto.jobPackageId,
    amount: amountToPay,
    originAmount: packagePrice,
    walletBalanceBefore: currentBalance,
    description,
    paymentUrl: payosResult.checkoutUrl,
    status: "pending",
    purpose: "wallet_topup",
  });

  return {
    ok: true,
    paymentRequired: true,
    amountToPay,
    balanceBefore: currentBalance,
    paymentUrl: payosResult.checkoutUrl,
    payment,
  };
};

//Just
export const processWebhookService = async (payload: any) => {
  await payos.webhooks.verify(payload);

  const data = payload.data;
  if (!data) throw new Error("Invalid webhook payload: missing data field");

  const payment = await PaymentModel.findOne({ orderCode: data.orderCode });
  if (!payment) throw new Error("Payment not found");

  if (payment.status === "paid") {
    console.log(`Payment with orderCode ${data.orderCode} already processed as paid.`);
    return payment;
  }

  payment.status =
    payload.success === true && payload.desc === "success" ? "paid" : "failed";

  await payment.save();

  // Chỉ xử lý NẠP TIỀN VÍ
  if (payment.status === "paid" && payment.purpose === "wallet_topup") {
    try {
      const { addCreditService } = await import("./wallet.service");

      const updatedWallet = await addCreditService(
        payment.recruiterId.toString(),
        {
          amount: payment.amount,
          reference: payment.orderCode,
          description: `Top-up via PayOS`,
        }
      );

      console.log("💰 Wallet updated:", updatedWallet.balance);

      // Tự động mua/kích hoạt subscription package nếu nạp tiền để mua gói
      if (payment.jobPackageId) {
        console.log("Automatically purchasing package for payment:", payment._id);
        try {
          const { buySubscriptionService } = await import("./subscription.service");
          const buyResult = await buySubscriptionService(payment.recruiterId.toString(), {
            packageId: payment.jobPackageId.toString(),
          });
          console.log("Auto package purchase result:", buyResult);
        } catch (buyErr: any) {
          console.error("Auto package purchase failed:", buyErr.message);
        }
      }

      return { payment, walletBalance: updatedWallet.balance };
    } catch (err: any) {
      console.error("Wallet update failed:", err.message);
    }
  }

  return payment;
};

export const verifyPaymentService = async (orderCode: string, recruiterId: string) => {
  const orderCodeNum = Number(orderCode);
  if (isNaN(orderCodeNum)) {
    throw new Error("Invalid orderCode");
  }

  const payment = await PaymentModel.findOne({ orderCode, recruiterId });
  if (!payment) {
    throw new Error("Payment not found or unauthorized");
  }

  if (payment.status === "paid") {
    return { success: true, payment, status: "paid" };
  }

  if (!payos) {
    throw new Error("PayOS is not configured on this server");
  }

  try {
    const payosInfo = await payos.paymentRequests.get(orderCodeNum);
    console.log(`PayOS status for orderCode ${orderCode}:`, payosInfo.status);

    if (payosInfo.status === "PAID") {
      payment.status = "paid";
      await payment.save();

      if (payment.purpose === "wallet_topup") {
        const { addCreditService } = await import("./wallet.service");
        const updatedWallet = await addCreditService(
          payment.recruiterId.toString(),
          {
            amount: payment.amount,
            reference: payment.orderCode,
            description: `Top-up via PayOS (Verify API)`,
          }
        );

        console.log("💰 Wallet updated via verify API:", updatedWallet.balance);

        if (payment.jobPackageId) {
          try {
            const { buySubscriptionService } = await import("./subscription.service");
            const buyResult = await buySubscriptionService(payment.recruiterId.toString(), {
              packageId: payment.jobPackageId.toString(),
            });
            console.log("Auto package purchase result via verify API:", buyResult);
          } catch (buyErr: any) {
            console.error("Auto package purchase failed via verify API:", buyErr.message);
          }
        }
      }
      return { success: true, payment, status: "paid" };
    } else if (["CANCELLED", "EXPIRED", "FAILED"].includes(payosInfo.status)) {
      payment.status = "failed";
      await payment.save();
      return { success: false, payment, status: "failed" };
    }

    return { success: false, payment, status: "pending" };
  } catch (err: any) {
    console.error("PayOS check payment failed:", err.message);
    throw err;
  }
};


export const getPaymentHistoryService = async (
  recruiterId: string,
  filters: {
    search?: string;
    status?: string;
    purpose?: string;
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    page?: number;
    limit?: number;
    sortOrder?: "asc" | "desc";
  } = {}
) => {
  const page = Number.isFinite(filters.page) && (filters.page || 0) > 0 ? filters.page! : 1;
  const limit = Number.isFinite(filters.limit)
    ? Math.min(Math.max(filters.limit || 10, 1), 100)
    : 10;
  const query: any = { recruiterId };

  if (filters.status && ["pending", "paid", "failed", "refunded"].includes(filters.status)) {
    query.status = filters.status;
  }
  if (
    filters.purpose &&
    ["subscription", "wallet_topup", "wallet_payment"].includes(filters.purpose)
  ) {
    query.purpose = filters.purpose;
  }
  if (filters.search?.trim()) {
    const escaped = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { orderCode: { $regex: escaped, $options: "i" } },
      { publicCode: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
  }
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      if (!Number.isNaN(from.getTime())) query.createdAt.$gte = from;
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      if (!Number.isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }
    if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
  }
  if (Number.isFinite(filters.minAmount) || Number.isFinite(filters.maxAmount)) {
    query.amount = {};
    if (Number.isFinite(filters.minAmount)) query.amount.$gte = filters.minAmount;
    if (Number.isFinite(filters.maxAmount)) query.amount.$lte = filters.maxAmount;
  }

  const [payments, total] = await Promise.all([
    PaymentModel.find(query)
      .populate("jobPackageId", "name type")
      .sort({ createdAt: filters.sortOrder === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    PaymentModel.countDocuments(query),
  ]);

  return {
    payments: payments.map((payment: any) => ({
      _id: payment._id,
      orderCode: payment.orderCode,
      publicCode: payment.publicCode,
      amount: payment.amount,
      originAmount: payment.originAmount,
      description: payment.description,
      purpose: payment.purpose,
      status: payment.status,
      paymentUrl: payment.paymentUrl,
      package: payment.jobPackageId
        ? {
            _id: payment.jobPackageId._id,
            name: payment.jobPackageId.name,
            type: payment.jobPackageId.type,
          }
        : null,
      refundStatus: payment.refundStatus,
      refundReason: payment.refundReason ?? null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
