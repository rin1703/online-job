// src/api/controllers/payment.controller.ts
import { Request, Response } from "express";
import * as paymentService from "../service/payment.service";
import { getPaymentHistoryService } from "../service/payment.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export const createPaymentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user.userId;
    const payment = await paymentService.createPayment(req.body, recruiterId);
    res.status(201).json({
      ok: true,
      message: "Payment link created successfully",
      paymentUrl: payment.paymentUrl,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

export const webhookController = async (req: Request, res: Response) => {
  try {
    let parsed;
    try {
      parsed = JSON.parse(req.body.toString("utf8"));
    } catch (jsonErr) {
      console.log("JSON parse error:", jsonErr);
      return res.status(200).send("OK");
    }
    // ⭐ IGNORE WEBHOOK TEST FROM PAYOS
    console.log("Received webhook payload:", parsed);
    await paymentService.processWebhookService(parsed);

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return res.status(200).send("OK");
  }
};

export const getPaymentHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user!.userId;
    const result = await getPaymentHistoryService(recruiterId);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
