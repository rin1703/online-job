import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createPreviewService,
  selectKeepJobsService,
  confirmDowngradeService,
  applyDowngradeService,
  getChangeRequestService,
} from "../service/dowgrade.service";

import { CreatePreviewDowngradeDTO } from "../dto/dowgrade/createDowgrade.dto";
import { ApplyDowngradeDTO } from "../dto/dowgrade/applyDowgade.dto";
import { SelectKeepJobsDTO } from "../dto/dowgrade/keepListing.dto";
import { ConfirmDowngradeDTO } from "../dto/dowgrade/confirmDowgrade.dto";
const getRequestParamString = (param: string | string[] | undefined, name = "parameter"): string => {
  if (!param) {
    throw new Error(`${name} is required`);
  }
  return Array.isArray(param) ? param[0] : param;
};
export const createDowngradePreview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const dto = req.body as CreatePreviewDowngradeDTO;
    const recruiterId = req.user!.userId;
    const result = await createPreviewService(recruiterId, dto);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const selectKeepJobs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const dto: SelectKeepJobsDTO = {
      requestId: req.body.requestId,
      keepJobIds: req.body.keepJobIds,
    };
    const recruiterId = req.user!.userId;
    const result = await selectKeepJobsService(recruiterId, dto);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const confirmDowngrade = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requestId = getRequestParamString(req.params.id, "id");
    const dto: ConfirmDowngradeDTO = {
      requestId,
    };
    const recruiterId = req.user!.userId;

    const result = await confirmDowngradeService(recruiterId, dto);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const applyDowngrade = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requestId = getRequestParamString(req.params.id, "id");
    const dto: ApplyDowngradeDTO = {
      requestId,
    };
    const recruiterId = req.user!.userId;
    const result = await applyDowngradeService(recruiterId, dto);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getChangeRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const id = getRequestParamString(req.params.id, "id");
    const result = await getChangeRequestService(id);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
