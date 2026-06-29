import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { CreateRefundRequestDTO } from "../dto/payment/refundRecruiter.dto";
import { AdminApproveRefundDTO } from "../dto/payment/refund.dto";
import {
  createRefundRequestService,
  adminApproveRefundRequest,
  getRefundRequestsService,
  adminGetAllRefundRequestsService,
} from "../service/refund.service";

const getRequestParamString = (param: string | string[] | undefined, name = "parameter"): string => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};

export const createRefundRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user!.userId;
    const dto = req.body as CreateRefundRequestDTO;

    const result = await createRefundRequestService(recruiterId, dto);

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};

export const adminApproveRefund = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const adminId = req.user!.userId;
    const dto = req.body as AdminApproveRefundDTO;
    const refundRequestId = getRequestParamString(req.params.id, "id");

    const result = await adminApproveRefundRequest(adminId, refundRequestId, dto);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};

export const getRefundRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const recruiterId = req.user!.userId;

    const result = await getRefundRequestsService(
      recruiterId,
      req.query as any
    );

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};

export const adminGetAllRefundRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    // Không filter recruiterId, chỉ filter status/phân trang
    const result = await adminGetAllRefundRequestsService(req.query as any);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ ok: false, message: err.message });
  }
};
