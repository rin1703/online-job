import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getMyWalletBalanceService } from "../service/wallet.service";

export const getMyWalletBalance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const result = await getMyWalletBalanceService(req.user.userId);

    if (!result.exists) {
      return res.status(404).json({
        message: "Wallet not found",
        balance: 0,
      });
    }

    return res.status(200).json({
      message: "Success",
      balance: result.balance,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: err.message,
    });
  }
};
