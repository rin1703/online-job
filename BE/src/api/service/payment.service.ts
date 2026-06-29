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

  const payosResult = await payos.paymentRequests.create({
    orderCode,
    amount: amountToPay,
    description,
    returnUrl: `${process.env.CORS_ORIGINS}/payment-success`,
    cancelUrl: `${process.env.CORS_ORIGINS}/payment-failure`,
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
      return { payment, walletBalance: updatedWallet.balance };
    } catch (err: any) {
      console.error("Wallet update failed:", err.message);
    }
  }

  return payment;
};

export const getPaymentHistoryService = async (
  recruiterId: string
): Promise<RefundResponseDTO[]> => {
  const payments = await PaymentModel.find({ recruiterId })
    .sort({ createdAt: -1 })
    .lean();

  return payments.map((p) => ({
    orderCode: p.orderCode,
    amount: p.amount,
    status: p.status,
    refundStatus: p.refundStatus,
    refundReason: p.refundReason ?? null,
  }));
};
