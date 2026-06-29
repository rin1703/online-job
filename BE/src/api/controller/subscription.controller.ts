import { Request, Response } from "express";
import * as subscriptionService from "../service/subscription.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { buySubscriptionService } from "../service/subscription.service";
import { BuySubscriptionDTO } from "../dto/payment/createPayment.dto";

const getRequestParamString = (
  param: string | string[] | undefined,
  name = "parameter"
): string => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};

/**
 * Tạo payment link để mua subscription
 */
// export const createSubscriptionPaymentController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { userId, packageId } = req.body;

//     if (!userId || !packageId) {
//       return res.status(400).json({
//         ok: false,
//         message: "userId and packageId are required",
//       });
//     }

//     const result = await subscriptionService.createSubscriptionPayment({
//       userId,
//       packageId,
//     });

//     res.status(201).json({
//       ok: true,
//       message: "Payment link created successfully",
//       data: result,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       ok: false,
//       message: err.message
//     });
//   }
// };

/**
 * Webhook từ PayOS khi thanh toán subscription
 */
// export const subscriptionWebhookController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     console.log("📥 Subscription Webhook Controller called");
//     console.log("Request body:", JSON.stringify(req.body, null, 2));

//     const result = await subscriptionService.verifySubscriptionWebhook(req.body);

//     if (result.success) {
//       console.log("✅ Subscription activated successfully:", result.subscription._id);
//       res.status(200).json({
//         ok: true,
//         message: "Subscription activated",
//         subscriptionId: result.subscription._id,
//       });
//     } else {
//       console.log("❌ Payment failed:", result.payment?.orderCode);
//       res.status(200).json({
//         ok: false,
//         message: result.message || "Payment failed",
//       });
//     }
//   } catch (err: any) {
//     console.error("❌ Subscription Webhook Controller Error:", err.message);
//     console.error("Error details:", err);
//     res.status(400).json({
//       ok: false,
//       message: err.message || "Webhook processing failed",
//       error: process.env.NODE_ENV === "development" ? err.stack : undefined,
//     });
//   }
// };

/**
 * Lấy subscription hiện tại của user
 */
export const getCurrentSubscriptionController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getRequestParamString(req.params.userId, "userId");

    const subscription = await subscriptionService.getCurrentSubscription(
      userId
    );

    if (!subscription) {
      return res.status(404).json({
        ok: false,
        message: "No active subscription found",
      });
    }

    res.status(200).json({
      ok: true,
      data: subscription,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

/**
 * Lấy thông tin gói đang dùng (bao gồm cả free plan)
 */
export const getSubscriptionInfoController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getRequestParamString(req.params.userId, "userId");

    const info = await subscriptionService.getUserSubscriptionInfo(userId);

    res.status(200).json({
      ok: true,
      data: info,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

/**
 * Lấy lịch sử subscriptions
 */
export const getSubscriptionHistoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getRequestParamString(req.params.userId, "userId");

    const history = await subscriptionService.getSubscriptionHistory(userId);

    res.status(200).json({
      ok: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

/**
 * Lấy subscription hiện tại kèm danh sách tất cả packages
 * Mỗi package sẽ có trường buyed để đánh dấu gói đang sử dụng
 */
export const getCurrentSubscriptionWithPackagesController = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getRequestParamString(req.params.userId, "userId");

    const result = await subscriptionService.getCurrentSubscriptionWithPackages(userId);

    res.status(200).json({
      ok: true,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// /**
//  * Hủy subscription
//  */
// export const cancelSubscriptionController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { userId } = req.body;

//     const subscription = await subscriptionService.cancelSubscription(userId);

//     res.status(200).json({
//       ok: true,
//       message: "Subscription cancelled successfully",
//       data: subscription,
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       ok: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * Kích hoạt subscription thủ công (dùng để test khi webhook không hoạt động)
//  */
// export const manuallyActivateSubscriptionController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { orderCode } = req.body;

//     if (!orderCode) {
//       return res.status(400).json({
//         ok: false,
//         message: "orderCode is required",
//       });
//     }

//     if (process.env.ALLOW_MANUAL_ACTIVATE !== 'true') {
//       return res.status(403).json({
//         ok: false,
//         message: "Manual activation is disabled",
//       });
//     }

//     const result = await subscriptionService.manuallyActivateSubscription(orderCode);

//     res.status(200).json({
//       ok: true,
//       message: result.message,
//       data: {
//         subscription: result.subscription,
//         payment: result.payment,
//       },
//     });
//   } catch (err: any) {
//     res.status(500).json({
//       ok: false,
//       message: err.message
//     });
//   }
// };

// /**
//  * Xử lý khi thanh toán thành công - tự động kích hoạt subscription
//  */
// export const subscriptionSuccessController = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { orderCode } = req.query;

//     if (!orderCode) {
//       return res.status(400).send(`
//         <html>
//           <body>
//             <h1>❌ Lỗi</h1>
//             <p>Thiếu orderCode trong URL</p>
//             <p>URL phải có dạng: /subscription/success?orderCode=1234567890</p>
//           </body>
//         </html>
//       `);
//     }

//     console.log("✅ Payment success callback received. OrderCode:", orderCode);
//     console.log("📥 Request query:", req.query);
//     console.log("📥 Request params:", req.params);

//     // Trả về trang thành công cho user
//     return res.status(200).send(`
//       <html>
//         <head>
//           <title>Thanh toán thành công</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               display: flex;
//               justify-content: center;
//               align-items: center;
//               height: 100vh;
//               margin: 0;
//               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//             }
//             .container {
//               background: white;
//               padding: 40px;
//               border-radius: 10px;
//               box-shadow: 0 10px 30px rgba(0,0,0,0.3);
//               text-align: center;
//               max-width: 500px;
//             }
//             h1 { color: #4CAF50; margin-bottom: 20px; }
//             .success-icon { font-size: 60px; margin-bottom: 20px; }
//             .info { background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
//             .info p { margin: 10px 0; }
//             .button {
//               display: inline-block;
//               padding: 12px 30px;
//               background: #667eea;
//               color: white;
//               text-decoration: none;
//               border-radius: 5px;
//               margin-top: 20px;
//             }
//             .button:hover { background: #5568d3; }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="success-icon">✅</div>
//             <h1>Thanh toán thành công!</h1>
//             <div class="info">
//               <p><strong>Mã đơn hàng:</strong> ${orderCode}</p>
//               <p><strong>Trạng thái:</strong> Thanh toán thành công. Subscription sẽ được kích hoạt sau khi webhook xác thực.</p>
//               <p><strong>Subscription ID:</strong> N/A</p>
//             </div>
//             <p>Hệ thống sẽ tự động kích hoạt subscription khi nhận webhook hợp lệ từ cổng thanh toán.</p>
//             <a href="${process.env.CORS_ORIGINS}" class="button">Quay về trang chủ</a>
//           </div>
//         </body>
//       </html>
//     `);
//   } catch (err: any) {
//     console.error("❌ Subscription success handler error:", err.message);

//     return res.status(500).send(`
//       <html>
//         <head>
//           <title>Lỗi kích hoạt subscription</title>
//           <style>
//             body {
//               font-family: Arial, sans-serif;
//               display: flex;
//               justify-content: center;
//               align-items: center;
//               height: 100vh;
//               margin: 0;
//               background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
//             }
//             .container {
//               background: white;
//               padding: 40px;
//               border-radius: 10px;
//               box-shadow: 0 10px 30px rgba(0,0,0,0.3);
//               text-align: center;
//               max-width: 500px;
//             }
//             h1 { color: #f5576c; margin-bottom: 20px; }
//             .error-icon { font-size: 60px; margin-bottom: 20px; }
//             .error-message { background: #ffe6e6; padding: 20px; border-radius: 5px; margin: 20px 0; color: #d32f2f; }
//             .button {
//               display: inline-block;
//               padding: 12px 30px;
//               background: #f5576c;
//               color: white;
//               text-decoration: none;
//               border-radius: 5px;
//               margin-top: 20px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="container">
//             <div class="error-icon">❌</div>
//             <h1>Lỗi kích hoạt subscription</h1>
//             <div class="error-message">
//               <p><strong>Lỗi:</strong> ${err.message}</p>
//               <p>Vui lòng liên hệ hỗ trợ hoặc thử lại sau.</p>
//             </div>
//             <a href="${process.env.CORS_ORIGINS}" class="button">Quay về trang chủ</a>
//           </div>
//         </body>
//       </html>
//     `);
//   }
// };

// /**
//  * Xử lý khi user hủy thanh toán
//  */
// export const subscriptionCancelController = async (
//   req: Request,
//   res: Response
// ) => {
//   const { orderCode } = req.query;

//   return res.status(200).send(`
//     <html>
//       <head>
//         <title>Thanh toán đã hủy</title>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//             margin: 0;
//             background: linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%);
//           }
//           .container {
//             background: white;
//             padding: 40px;
//             border-radius: 10px;
//             box-shadow: 0 10px 30px rgba(0,0,0,0.3);
//             text-align: center;
//             max-width: 500px;
//           }
//           h1 { color: #ff9800; margin-bottom: 20px; }
//           .cancel-icon { font-size: 60px; margin-bottom: 20px; }
//           .button {
//             display: inline-block;
//             padding: 12px 30px;
//             background: #ff9800;
//             color: white;
//             text-decoration: none;
//             border-radius: 5px;
//             margin-top: 20px;
//           }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="cancel-icon">⚠️</div>
//           <h1>Thanh toán đã hủy</h1>
//           <p>Bạn đã hủy thanh toán. Subscription chưa được kích hoạt.</p>
//           ${orderCode ? `<p><strong>Mã đơn hàng:</strong> ${orderCode}</p>` : ''}
//           <a href="${process.env.CORS_ORIGINS}" class="button">Quay về trang chủ</a>
//         </div>
//       </body>
//     </html>
//   `);
// };

/**
 * Mua subscription bằng wallet
 */
export const buySubscription = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const dto: BuySubscriptionDTO = {
      packageId: req.body.packageId,
    };

    const result = await buySubscriptionService(req.user.userId, dto);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
};
