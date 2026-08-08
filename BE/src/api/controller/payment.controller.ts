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
    const result = await getPaymentHistoryService(recruiterId, {
      search: req.query.search as string,
      status: req.query.status as string,
      purpose: req.query.purpose as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      sortOrder: req.query.sortOrder === "asc" ? "asc" : "desc",
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const verifyPaymentController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user!.userId;
    const { orderCode } = req.body;
    if (!orderCode) {
      return res.status(400).json({ ok: false, message: "Missing orderCode" });
    }

    const result = await paymentService.verifyPaymentService(orderCode.toString(), recruiterId);
    return res.status(200).json({
      ok: true,
      success: result.success,
      status: result.status,
      payment: result.payment,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

