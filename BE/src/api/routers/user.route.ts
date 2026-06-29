import { Router } from "express";
import { getAllUsers, registerJobSeeker, registerRecruiter, login, logout } from "../controller/user.controller";
import {
  validateUserRegistration,
  validateRecruiterRegistration,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} from "../middleware/validation";
import { verifyToken } from "../middleware/auth.middleware";
import passport from "../../config/passport.config";
import { googleAuthCallback } from "../controller/googleAuth.controller";
import {
  handleForgotPassword,
  handleResetPassword,
} from "../controller/forgotPassword.controller";
import { handleChangePassword } from "../controller/password.controller";
import { handleActivateAccount } from "../controller/adminRecruiter.controller";

const router: Router = Router();

// Remove /user from here since we'll define it in index.router.ts
router.get("/", getAllUsers);

/**
 * POST /auth/register - Register new job seeker
 */
router.post("/auth/register", validateUserRegistration, registerJobSeeker);

/**
 * POST /auth/register/recruiter - Register new recruiter
 */
router.post(
  "/auth/register/recruiter",
  validateRecruiterRegistration,
  registerRecruiter
);

/**
 * POST /auth/login - Authenticate user
 */
router.post("/auth/login", validateLogin, login);

/**
 * POST /auth/logout - Logout user
 */
router.post("/auth/logout", verifyToken, logout);

/**
 * GET /auth/google - Initiate Google OAuth
 */
router.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * GET /auth/google/callback - Handle Google OAuth callback
 */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/login/failed",
  }),
  googleAuthCallback
);

/**
 * POST /auth/forgot-password - Send OTP to email for password reset
 */
router.post("/auth/forgot-password", validateForgotPassword, handleForgotPassword);

/**
 * POST /auth/reset-password - Reset password with OTP
 */
router.post("/auth/reset-password", validateResetPassword, handleResetPassword);

/**
 * PUT /password/change - Change password for authenticated user
 */
router.put("/password/change", verifyToken, validateChangePassword, handleChangePassword);

/**
 * GET /auth/activate/:token - Activate recruiter account with token
 * Public endpoint - không cần authentication
 */
router.get("/auth/activate/:token", handleActivateAccount);

export default router;
