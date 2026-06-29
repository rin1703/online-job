import { Request, Response } from "express";
import {
  GetPendingRecruitersDTO,
  ApproveRecruiterDTO,
  RejectRecruiterDTO,
  ActivateRecruiterAccountDTO,
} from "../dto/recruiter/adminRecruiter.dto";
import {
  getAllRecruiters,
  getPendingRecruiters,
  getRecruiterDetail,
  approveRecruiter,
  rejectRecruiter,
  activateRecruiterAccount,
  resendActivationEmail,
} from "../service/adminRecruiter.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
  sendBadRequestResponse,
  handleInternalError,
} from "../../helper/response.helper";
import { HTTP_STATUS } from "../../helper/constants.helper";

/**
 * ==============================================
 * ADMIN RECRUITER MANAGEMENT CONTROLLER
 * ==============================================
 * Xử lý các request liên quan đến quản lý recruiter
 */

// ============== GET RECRUITERS ==============

/**
 * GET /api/v1/admin/recruiters
 * Lấy danh sách tất cả recruiter
 */
export const handleGetAllRecruiters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dto = new GetPendingRecruitersDTO(req.query);
    const result = await getAllRecruiters(dto);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    handleInternalError(res, error, "Lấy danh sách recruiter");
  }
};

/**
 * GET /api/v1/admin/recruiters/pending
 * Lấy danh sách recruiter chờ duyệt
 */
export const handleGetPendingRecruiters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const dto = new GetPendingRecruitersDTO(req.query);
    const result = await getPendingRecruiters(dto);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    handleInternalError(res, error, "Lấy danh sách recruiter chờ duyệt");
  }
};

/**
 * GET /api/v1/admin/recruiters/:id
 * Lấy chi tiết một recruiter
 */
export const handleGetRecruiterDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await getRecruiterDetail(id);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

// ============== APPROVE RECRUITER ==============

/**
 * POST /api/v1/admin/recruiters/:id/approve
 * Admin duyệt recruiter
 */
export const handleApproveRecruiter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const adminId = (req as any).user?.userId; // Lấy từ auth middleware

    if (!adminId) {
      sendErrorResponse(
        res,
        "Không tìm thấy thông tin admin",
        HTTP_STATUS.UNAUTHORIZED
      );
      return;
    }

    const dto = new ApproveRecruiterDTO({ recruiterId: id });
    const errors = dto.validate();

    if (errors.length > 0) {
      sendBadRequestResponse(res, errors.join(", "));
      return;
    }

    const result = await approveRecruiter(id, adminId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

// ============== REJECT RECRUITER ==============

/**
 * POST /api/v1/admin/recruiters/:id/reject
 * Admin từ chối recruiter
 * Body: { rejectionReason: string }
 */
export const handleRejectRecruiter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const { rejectionReason } = req.body;
    const adminId = (req as any).user?.userId;

    if (!adminId) {
      sendErrorResponse(
        res,
        "Không tìm thấy thông tin admin",
        HTTP_STATUS.UNAUTHORIZED
      );
      return;
    }

    const dto = new RejectRecruiterDTO({ recruiterId: id, rejectionReason });
    const errors = dto.validate();

    if (errors.length > 0) {
      sendBadRequestResponse(res, errors.join(", "));
      return;
    }

    const result = await rejectRecruiter(id, rejectionReason, adminId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

// ============== ACTIVATE ACCOUNT ==============

/**
 * GET /api/v1/auth/activate/:token
 * Kích hoạt tài khoản recruiter qua token
 * Public endpoint (không cần auth)
 */
export const handleActivateAccount = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.params.token as string;
    const dto = new ActivateRecruiterAccountDTO({ token });
    const errors = dto.validate();

    if (errors.length > 0) {
      sendBadRequestResponse(res, errors.join(", "));
      return;
    }

    const result = await activateRecruiterAccount(token);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};

// ============== RESEND ACTIVATION EMAIL ==============

/**
 * POST /api/v1/admin/recruiters/:id/resend-activation
 * Gửi lại email kích hoạt cho recruiter
 */
export const handleResendActivationEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const result = await resendActivationEmail(id);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: any) {
    sendErrorResponse(res, error.message, HTTP_STATUS.BAD_REQUEST);
  }
};
