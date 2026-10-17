import { Router } from "express";
import validateRequest from "../../middleware/validateRequest.js";
import { authenticate, authorizeRoles } from "../../middleware/authMiddleware.js";
import { createRateLimiter } from "../../middleware/rateLimiter.js";
import {
  login,
  register,
  refreshToken,
  logout,
  getMe,
  changePassword,
} from "./authController.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from "./authValidation.js";

const router = Router();

// Rate limiter for authentication attempts (15 attempts per 15 minutes per IP)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: "Too many login attempts from this network. Please wait 15 minutes before trying again.",
});

// POST /api/v1/auth/login
router.post(
  "/login",
  authLimiter,
  validateRequest({ body: loginSchema }),
  login
);

// POST /api/v1/auth/refresh-token
router.post(
  "/refresh-token",
  validateRequest({ body: refreshTokenSchema }),
  refreshToken
);

// POST /api/v1/auth/register (Admin only)
router.post(
  "/register",
  authenticate,
  authorizeRoles("Admin"),
  validateRequest({ body: registerSchema }),
  register
);

// GET /api/v1/auth/me (Protected)
router.get("/me", authenticate, getMe);

// POST /api/v1/auth/logout (Protected)
router.post("/logout", authenticate, logout);

// POST /api/v1/auth/change-password (Protected)
router.post(
  "/change-password",
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  changePassword
);

export default router;
