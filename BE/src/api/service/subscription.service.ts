import { PaymentModel } from "../models/payment.model";
import { SubscriptionModel } from "../models/subscription.model";
import SubscriptionPackage from "../models/subscriptionPackage.model";
import { CreateSubscriptionPaymentDTO } from "../dto/createSubscription.dto";
import {
  generateOrderCode,
  generatePublicCode,
} from "../../helper/generateCode.help";
import {
  generatePayOSDescription,
  generateFullDescription,
} from "../../helper/generatePaymentDescription.helper";
import mongoose from "mongoose";
import { WalletModel } from "../models/wallet.model";
import { WalletTransactionModel } from "../models/walletTransaction.model";
import { BuySubscriptionDTO } from "../dto/payment/createPayment.dto";
import { checkReplicaSet } from "../../helper/database.helper";

/**
 * Tạo payment link để mua subscription package
 */
// export const createSubscriptionPayment = async (dto: CreateSubscriptionPaymentDTO) => {
//   // 1. Kiểm tra package có tồn tại và active không
//   const subscriptionPackage = await SubscriptionPackage.findById(dto.packageId);
//   if (!subscriptionPackage || !subscriptionPackage.isActive) {
//     throw new Error("Subscription package not found or inactive");
//   }

//   // 2. Kiểm tra user đã có subscription active chưa
//   const userIdObjectId = new mongoose.Types.ObjectId(dto.userId);
//   const existingSubscription = await SubscriptionModel.findOne({
//     userId: userIdObjectId,
//     status: "active",
//     endDate: { $gt: new Date() },
//   });

//   if (existingSubscription) {
//     throw new Error("User already has an active subscription");
//   }

//   // 2.5. Kiểm tra xem đã có payment pending cho user+package này chưa (tránh duplicate)
//   const existingPendingPayment = await PaymentModel.findOne({
//     recruiterId: userIdObjectId,
//     jobPackageId: new mongoose.Types.ObjectId(dto.packageId),
//     status: "pending",
//     createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Trong vòng 5 phút
//   });

//   if (existingPendingPayment) {
//     console.log("⚠️ Found existing pending payment, returning it:", existingPendingPayment.orderCode);
//     return {
//       paymentUrl: existingPendingPayment.paymentUrl,
//       orderCode: existingPendingPayment.orderCode,
//       publicCode: existingPendingPayment.publicCode,
//       amount: existingPendingPayment.amount,
//       packageName: subscriptionPackage.name,
//     };
//   }

//   // 3. Tạo orderCode
//   const orderCode = generateOrderCode();
//   const publicCode = generatePublicCode(orderCode);

//   console.log("🆕 Creating new payment. OrderCode:", orderCode, "UserId:", dto.userId, "PackageId:", dto.packageId);

//   // 4. Tạo payment request với PayOS
//   // PayOS yêu cầu description tối đa 25 ký tự
//   const shortDescription = generatePayOSDescription(
//     subscriptionPackage.type,
//     subscriptionPackage.duration.value,
//     subscriptionPackage.duration.unit
//   );

//   const payosResult = await payos.paymentRequests.create({
//     orderCode,
//     amount: subscriptionPackage.price,
//     description: shortDescription, // ✅ Tối đa 25 ký tự
//     returnUrl: `${process.env.CORS_ORIGINS}/api/v1/subscriptions/success?orderCode=${orderCode}`,
//     cancelUrl: `${process.env.CORS_ORIGINS}/api/v1/subscriptions/cancel?orderCode=${orderCode}`,
//   });

//   console.log("✅ Payment created. OrderCode:", orderCode, "Checkout URL:", payosResult.checkoutUrl);

//   // 5. Lưu payment record với description đầy đủ
//   const fullDescription = generateFullDescription(
//     subscriptionPackage.name,
//     subscriptionPackage.duration.value,
//     subscriptionPackage.duration.unit
//   );

//   const payment = await PaymentModel.create({
//     orderCode: orderCode.toString(),
//     publicCode,
//     recruiterId: dto.userId,
//     jobPackageId: dto.packageId,
//     amount: subscriptionPackage.price,
//     description: fullDescription, // Lưu description đầy đủ cho database
//     paymentUrl: payosResult.checkoutUrl,
//     status: "pending",
//   });

//   return {
//     paymentUrl: payment.paymentUrl,
//     orderCode: payment.orderCode,
//     publicCode: payment.publicCode,
//     amount: payment.amount,
//     packageName: subscriptionPackage.name,
//   };
// };

/**
 * Xử lý webhook từ PayOS khi thanh toán subscription thành công
 */
// export const verifySubscriptionWebhook = async (body: any) => {

//   try {
//     // 1. Verify webhook từ PayOS
//     const data = await payos.webhooks.verify(body);
//     console.log("✅ Webhook verified. OrderCode:", data.orderCode, "Desc:", data.desc);

//     // 2. Tìm payment record (orderCode có thể là number hoặc string)
//     const orderCodeStr = data.orderCode?.toString();
//     const payment = await PaymentModel.findOne({
//       orderCode: orderCodeStr
//     });

//     if (!payment) {
//       console.error("❌ Payment not found for orderCode:", orderCodeStr);
//       throw new Error(`Payment not found for orderCode: ${orderCodeStr}`);
//     }

//     console.log("✅ Payment found:", payment._id, "Status:", payment.status);

//     // 3. Nếu thanh toán thành công
//     if (data.desc === "success") {
//       // Kiểm tra xem đã có subscription cho payment này chưa (tránh duplicate)
//       const existingSubscription = await SubscriptionModel.findOne({
//         paymentId: payment._id,
//       });

//       if (existingSubscription) {
//         console.log("⚠️ Subscription already exists for this payment:", existingSubscription._id);
//         return {
//           success: true,
//           subscription: existingSubscription,
//           payment,
//           message: "Subscription already exists",
//         };
//       }

//       payment.status = "paid";
//       await payment.save();
//       console.log("✅ Payment status updated to 'paid'");

//       // 4. Lấy thông tin package
//       const subscriptionPackage = await SubscriptionPackage.findById(
//         payment.jobPackageId
//       );

//       if (!subscriptionPackage) {
//         console.error("❌ Subscription package not found for ID:", payment.jobPackageId);
//         throw new Error(`Subscription package not found for ID: ${payment.jobPackageId}`);
//       }

//       console.log("✅ Subscription package found:", subscriptionPackage.name);

//       // 5. Tính toán startDate và endDate
//       const startDate = new Date();
//       const endDate = calculateEndDate(
//         startDate,
//         subscriptionPackage.duration.value,
//         subscriptionPackage.duration.unit
//       );

//       console.log("📅 Subscription period:", startDate, "to", endDate);

//       // 6. Kiểm tra user đã có subscription active chưa (nếu có thì cancel cái cũ)
//       const userIdObjectId = new mongoose.Types.ObjectId(payment.recruiterId);
//       const activeSubscription = await SubscriptionModel.findOne({
//         userId: userIdObjectId,
//         status: "active",
//         endDate: { $gt: new Date() },
//       });

//       if (activeSubscription) {
//         console.log("⚠️ User already has active subscription, cancelling old one:", activeSubscription._id);
//         activeSubscription.status = "cancelled";
//         await activeSubscription.save();
//       }

//       // 7. Tạo subscription record
//       const subscription = await SubscriptionModel.create({
//         userId: payment.recruiterId,
//         packageId: payment.jobPackageId,
//         paymentId: payment._id,
//         startDate,
//         endDate,
//         status: "active",
//         features: subscriptionPackage.features, // Lưu snapshot features
//       });

//       console.log("✅ Subscription created successfully:", subscription._id);

//       return {
//         success: true,
//         subscription,
//         payment,
//       };
//     } else {
//       // Thanh toán thất bại
//       console.log("❌ Payment failed. Desc:", data.desc);
//       payment.status = "failed";
//       await payment.save();

//       return {
//         success: false,
//         payment,
//         message: `Payment failed: ${data.desc}`,
//       };
//     }
//   } catch (error: any) {
//     console.error("❌ Subscription Webhook Error:", error.message);
//     console.error("Error stack:", error.stack);
//     throw error;
//   }
// };

/**
 * Helper function: Tính endDate dựa vào duration
 */
function calculateEndDate(startDate: Date, value: number, unit: string): Date {
  const endDate = new Date(startDate);

  switch (unit) {
    case "day":
      endDate.setDate(endDate.getDate() + value);
      break;
    case "month":
      endDate.setMonth(endDate.getMonth() + value);
      break;
    case "year":
      endDate.setFullYear(endDate.getFullYear() + value);
      break;
    default:
      throw new Error("Invalid duration unit");
  }

  return endDate;
}

/**
 * Lấy subscription hiện tại của user
 */
export const getCurrentSubscription = async (userId: string) => {
  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const subscription = await SubscriptionModel.findOne({
    userId: userIdObjectId,
    status: "active",
    endDate: { $gt: new Date() },
  })
    .populate("packageId")
    .populate("paymentId")
    .sort({ createdAt: -1 }); // Lấy subscription mới nhất

  return subscription;
};

/**
 * Lấy subscription hiện tại của user kèm theo danh sách tất cả packages
 * Mỗi package sẽ có trường buyed để đánh dấu gói đang sử dụng
 */
export const getCurrentSubscriptionWithPackages = async (userId: string) => {
  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Lấy subscription hiện tại của user
  const subscription = await SubscriptionModel.findOne({
    userId: userIdObjectId,
    status: "active",
    endDate: { $gt: new Date() },
  })
    .populate("packageId")
    .sort({ createdAt: -1 }); // Lấy subscription mới nhất

  // 2. Lấy tất cả packages active
  const allPackages = await SubscriptionPackage.find({ isActive: true })
    .sort({ displayOrder: 1, createdAt: -1 });

  // 3. Import DTO
  const { SubscriptionPackageWithStatusDTO } = require('../dto/subscriptionPackage');

  // 4. Map packages với trường buyed
  const currentPackageId = subscription?.packageId?._id?.toString();

  const packagesWithStatus = allPackages.map((pkg: any) => {
    const isBuyed = pkg._id.toString() === currentPackageId;
    return new SubscriptionPackageWithStatusDTO(pkg, isBuyed);
  });

  return {
    subscription: subscription ? {
      _id: subscription._id,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      daysRemaining: calculateDaysRemaining(subscription.endDate),
    } : null,
    packages: packagesWithStatus,
  };
};

/**
 * Kiểm tra user có subscription active không
 */
export const hasActiveSubscription = async (
  userId: string
): Promise<boolean> => {
  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const subscription = await SubscriptionModel.findOne({
    userId: userIdObjectId,
    status: "active",
    endDate: { $gt: new Date() },
  });

  return !!subscription;
};

/**
 * Lấy thông tin gói đang sử dụng (bao gồm features)
 */
export const getUserSubscriptionInfo = async (userId: string) => {
  try {
    // Convert userId string to ObjectId for proper querying
    const userIdObjectId = new mongoose.Types.ObjectId(userId);

    const subscription = await SubscriptionModel.findOne({
      userId: userIdObjectId,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("packageId");

    if (!subscription) {
      return {
        hasSubscription: false,
        packageType: "free",
        features: getFreePlanFeatures(), // Features mặc định cho user free
      };
    }

    const packageData = subscription.packageId as any;

    return {
      hasSubscription: true,
      packageType: packageData.type,
      packageName: packageData.name,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining: calculateDaysRemaining(subscription.endDate),
      features: subscription.features,
    };
  } catch (error: any) {
    // If userId is invalid ObjectId, return free plan
    if (error.name === "BSONTypeError" || error.message?.includes("ObjectId")) {
      console.error(`Invalid userId format: ${userId}`);
      return {
        hasSubscription: false,
        packageType: "free",
        features: getFreePlanFeatures(),
      };
    }
    throw error;
  }
};

/**
 * Lấy lịch sử subscriptions của user
 */
export const getSubscriptionHistory = async (userId: string) => {
  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const subscriptions = await SubscriptionModel.find({ userId: userIdObjectId })
    .populate("packageId")
    .populate("paymentId")
    .sort({ createdAt: -1 });

  return subscriptions;
};

/**
 * Helper: Tính số ngày còn lại
 */
function calculateDaysRemaining(endDate: Date): number {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Features mặc định cho free plan
 */
function getFreePlanFeatures() {
  return {
    jobPostings: {
      limit: 3,
      featured: 0,
    },
    candidateSearch: {
      enabled: false,
      viewsPerMonth: 0,
      downloadCV: false,
    },
    messaging: {
      enabled: false,
      messagesPerMonth: 0,
    },
    support: {
      priority: "none",
      analytics: false,
      advancedReports: false,
    },
    advertising: {
      homepageBanner: false,
      emailCampaign: 0,
      socialMediaPromotion: false,
    },
  };
}

/**
 * Hủy subscription
 */
export const cancelSubscription = async (userId: string) => {
  const userIdObjectId = new mongoose.Types.ObjectId(userId);

  const subscription = await SubscriptionModel.findOne({
    userId: userIdObjectId,
    status: "active",
  });

  if (!subscription) {
    throw new Error("No active subscription found");
  }

  subscription.status = "cancelled";
  await subscription.save();

  return subscription;
};

/**
 * Kiểm tra và cập nhật subscription hết hạn (chạy bằng cron job)
 */
export const checkExpiredSubscriptions = async () => {
  const now = new Date();

  const result = await SubscriptionModel.updateMany(
    {
      status: "active",
      endDate: { $lt: now },
    },
    {
      $set: { status: "expired" },
    }
  );

  return result;
};

/**
 * Purchase subscription using wallet balance (immediate)
 */
export const buySubscriptionService = async (
  userId: string,
  dto: BuySubscriptionDTO
) => {
  const { packageId } = dto;

  // 0. Kiểm tra/Xử lý Gói Hiện Tại (tìm gói active)
  const activeSub = await SubscriptionModel.findOne({
    userId,
    status: "active",
  });

  // 1. Validate package
  const pkg = await SubscriptionPackage.findById(packageId);
  if (!pkg || !pkg.isActive) {
    throw new Error("Invalid package");
  }

  const priceToPay = pkg.price;

  // 2. Get wallet (Kiểm tra ban đầu trước khi Transaction)
  const wallet = await WalletModel.findOne({ recruiterId: userId });
  if (!wallet) throw new Error("Wallet not found");

  if (wallet.balance < priceToPay) {
    throw new Error("Not enough wallet balance for initial check.");
  }

  // --- Khởi tạo Transaction ATOMIC ---
  const useTransaction = await checkReplicaSet();
  const session = useTransaction ? await SubscriptionModel.startSession() : null;
  if (session) {
    session.startTransaction();
  }

  try {
    const transactionId = new mongoose.Types.ObjectId();

    // 3. Deduction (Trừ tiền ATOMIC và kiểm tra lại số dư)
    const updatedWallet = await WalletModel.findOneAndUpdate(
      { _id: wallet._id, balance: { $gte: priceToPay } }, // Đảm bảo số dư đủ
      { $inc: { balance: -priceToPay } }, // Trừ tiền
      { new: true, ...(session ? { session } : {}) } // Lấy doc mới và dùng session
    );

    if (!updatedWallet) {
      // Sẽ bị lỗi nếu số dư không đủ hoặc wallet không tìm thấy/bị khóa
      throw new Error(
        "Wallet update failed or not enough balance (Atomic check failed)."
      );
    }

    // 4. Save wallet transaction (Ghi nhận giao dịch)
    await WalletTransactionModel.create(
      [
        {
          walletId: wallet._id,
          type: "debit",
          amount: priceToPay,
          reference: `sub_purchase_${transactionId.toHexString()}`, // Mã DUY NHẤT
          description: `Buy subscription package ${pkg.name}`,
        },
      ],
      session ? { session } : undefined
    );

    // --- 5. Logic Nâng/Hạ cấp & Tạo Subscription ---
    let startDate = new Date();

    if (activeSub) {
      // 5a. Hủy gói cũ (Cancelled)
      activeSub.status = "cancelled";
      (activeSub as any).cancellationDate = startDate;
      // [TÙY CHỌN]: Thêm logic tính hoàn tiền tỷ lệ ở đây
      await activeSub.save(session ? { session } : undefined);
    }

    // 5b. Tính toán EndDate mới (Bắt đầu từ ngày mua)
    const endDate = calculateEndDate(
      startDate,
      (pkg as any).duration.value,
      (pkg as any).duration.unit
    );

    // 5c. Tạo Subscription MỚI (Luôn tạo mới để giữ lịch sử)
    const subscription = await SubscriptionModel.create(
      [
        {
          userId,
          packageId: pkg._id, // Dùng ID gói vừa tìm được
          startDate,
          endDate,
          status: "active",
          features: pkg.features,
        },
      ],
      session ? { session } : undefined
    );

    // COMMIT Giao dịch
    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    return {
      message: "Subscription updated/activated successfully",
      subscription: subscription[0],
      walletBalance: updatedWallet.balance,
    };
  } catch (error) {
    // ROLLBACK nếu có lỗi xảy ra
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.error("Subscription purchase transaction failed:", error);
    throw error;
  }
};

// /**
//  * Kích hoạt subscription thủ công (dùng để test khi webhook không hoạt động)
//  */
// export const manuallyActivateSubscription = async (orderCode: string) => {
//   console.log("🔧 Manually activating subscription for orderCode:", orderCode);

//   // 1. Tìm payment record (thử cả number và string)
//   const orderCodeStr = orderCode.toString();
//   let payment = await PaymentModel.findOne({
//     orderCode: orderCodeStr
//   });

//   // Nếu không tìm thấy, thử tìm với orderCode là number
//   if (!payment) {
//     const orderCodeNum = parseInt(orderCodeStr, 10);
//     if (!isNaN(orderCodeNum)) {
//       payment = await PaymentModel.findOne({
//         orderCode: orderCodeNum.toString()
//       });
//     }
//   }

//   if (!payment) {
//     console.error("❌ Payment not found. Searched for orderCode:", orderCodeStr);
//     // Log tất cả payments gần đây để debug
//     const recentPayments = await PaymentModel.find({})
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .select("orderCode status createdAt");
//     console.log("📋 Recent payments:", recentPayments);
//     throw new Error(`Payment not found for orderCode: ${orderCode}`);
//   }
//
//   console.log("✅ Payment found:", payment._id, "Status:", payment.status);
//
//   // 2. Lấy thông tin package
//   const subscriptionPackage = await SubscriptionPackage.findById(
//     payment.jobPackageId
//   );
//
//   if (!subscriptionPackage) {
//     console.error("❌ Subscription package not found for ID:", payment.jobPackageId);
//     throw new Error(`Subscription package not found for ID: ${payment.jobPackageId}`);
//   }
//
//   console.log("✅ Subscription package found:", subscriptionPackage.name);
//
//   // 3. Kiểm tra xem đã có subscription cho payment này chưa (tránh duplicate)
//   const existingSubscription = await SubscriptionModel.findOne({
//     paymentId: payment._id,
//   });
//
//   if (existingSubscription) {
//     console.log("⚠️ Subscription already exists for this payment:", existingSubscription._id);
//     return {
//       message: "Subscription already exists",
//       subscription: existingSubscription,
//       payment,
//     };
//   }
//
//   // 4. Cập nhật payment status
//   payment.status = "paid";
//   await payment.save();
//   console.log("✅ Payment status updated to 'paid'");
//
//   // 5. Tính toán startDate và endDate
//   const startDate = new Date();
//   const endDate = calculateEndDate(
//     startDate,
//     subscriptionPackage.duration.value,
//     subscriptionPackage.duration.unit
//   );
//
//   console.log("📅 Subscription period:", startDate, "to", endDate);
//
//   // 6. Kiểm tra user đã có subscription active chưa (nếu có thì cancel cái cũ)
//   const userIdObjectId = new mongoose.Types.ObjectId(payment.recruiterId);
//   const activeSubscription = await SubscriptionModel.findOne({
//     userId: userIdObjectId,
//     status: "active",
//     endDate: { $gt: new Date() },
//   });
//
//   if (activeSubscription) {
//     console.log("⚠️ User already has active subscription, cancelling old one:", activeSubscription._id);
//     activeSubscription.status = "cancelled";
//     await activeSubscription.save();
//   }
//
//   // 7. Tạo subscription record
//   const subscription = await SubscriptionModel.create({
//     userId: payment.recruiterId,
//     packageId: payment.jobPackageId,
//     paymentId: payment._id,
//     startDate,
//     endDate,
//     status: "active",
//     features: subscriptionPackage.features,
//   });
//
//   console.log("✅ Subscription created successfully:", subscription._id);
//
//   return {
//     message: "Subscription activated successfully",
//     subscription,
//     payment,
//   };
// };
