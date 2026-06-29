import { Request, Response } from "express";
import { tokenHelper } from "../../helper/constants.helper";

export const googleAuthCallback = (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    // Lấy frontend URL từ CORS_ORIGINS hoặc fallback
    const frontendUrl = process.env.CORS_ORIGINS || 'http://localhost:3000';

    // Nếu không có user, redirect với error
    if (!user) {
      return res.redirect(`${frontendUrl}/auth/sign-in?error=auth_failed`);
    }

    // Kiểm tra account active
    if (!user.isActive) {
      return res.redirect(`${frontendUrl}/auth/sign-in?error=account_disabled`);
    }

    // Generate JWT token
    const token = tokenHelper.sign({
      userId: user._id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Redirect về frontend với token trong URL
    const callbackUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`;

    console.log('[GoogleAuth] Redirecting to:', callbackUrl);
    res.redirect(callbackUrl);
  } catch (error) {
    console.error('[GoogleAuth] Error:', error);
    const frontendUrl = process.env.CORS_ORIGINS || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/sign-in?error=server_error`);
  }
};