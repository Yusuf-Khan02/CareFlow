import type { Request, Response, NextFunction } from "express";
import { authService } from "./authService.js";

/**
 * POST /api/v1/auth/login
 * Authenticate with credentials and receive JWT access & refresh tokens.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const result = await authService.login(req.body, ipAddress);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * Admin-only user account provisioning.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const adminUserId = req.user?.id;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await authService.register(req.body, adminUserId, ipAddress);

    res.status(201).json({
      success: true,
      message: "User account created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/refresh-token
 * Issue a new access token using a valid refresh token.
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    res.json({
      success: true,
      message: "Access token refreshed",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/logout
 * Revoke active refresh token on logout.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await authService.logout(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/me
 * Retrieve the active user's profile and permissions.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await authService.getMe(userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/change-password
 * Change password for authenticated user.
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await authService.changePassword(userId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
