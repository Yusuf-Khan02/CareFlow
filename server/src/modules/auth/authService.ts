import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import ENV from "../../config/env.js";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  ForbiddenError,
} from "../../utils/errors.js";
import type { z } from "zod";
import type {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from "./authValidation.js";

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const authService = {
  /**
   * Authenticate user with email & password, issuing JWT access & refresh tokens.
   */
  async login(input: LoginInput, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        doctorProfile: {
          select: {
            id: true,
            name: true,
            specialty: true,
            status: true,
            room: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password credentials");
    }

    if (user.status !== "Active") {
      throw new ForbiddenError(
        `Your user account is ${user.status.toLowerCase()}. Please contact hospital administration.`
      );
    }

    // Verify bcrypt password hash
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    } catch {
      // In case of any parsing fault, fall back to false
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password credentials");
    }

    // Generate JWT Access Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    // Generate Refresh Token
    const refreshToken = jwt.sign(
      { id: user.id },
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any }
    );

    // Persist refresh token & audit log
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { refreshToken },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          entityName: "User",
          entityId: user.id,
          details: JSON.stringify({ role: user.role, email: user.email }),
          ipAddress: ipAddress || null,
        },
      }),
    ]);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        organization: user.organization,
        doctorProfile: user.doctorProfile,
      },
    };
  },

  /**
   * Renew expired access token using a valid refresh token.
   */
  async refreshAccessToken(refreshToken: string) {
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token. Please log in again.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError("Refresh token has been revoked or is invalid");
    }

    if (user.status !== "Active") {
      throw new ForbiddenError("Account is no longer active");
    }

    // Issue new access token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return { token };
  },

  /**
   * Register a new user account (Admin only).
   */
  async register(input: RegisterInput, adminUserId?: string, ipAddress?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError(`An account with email ${input.email} already exists.`);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    let organizationId = input.organizationId;
    if (!organizationId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) organizationId = defaultOrg.id;
    }

    const newUser = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        name: input.name,
        role: input.role || "Staff",
        status: "Active",
        organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId || newUser.id,
        action: "CREATE",
        entityName: "User",
        entityId: newUser.id,
        details: JSON.stringify({
          createdUser: newUser.email,
          role: newUser.role,
          createdBy: adminUserId || "Self-Registration",
        }),
        ipAddress: ipAddress || null,
      },
    });

    return newUser;
  },

  /**
   * Invalidate user refresh token on logout.
   */
  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { success: true, message: "Logged out successfully" };
  },

  /**
   * Retrieve current authenticated user profile.
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        organizationId: true,
        createdAt: true,
        doctorProfile: {
          select: {
            id: true,
            name: true,
            title: true,
            specialty: true,
            status: true,
            room: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("Authenticated user record not found");
    }

    return user;
  },

  /**
   * Change user password.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    const newHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        refreshToken: null, // Force re-login on other devices
      },
    });

    return { success: true, message: "Password updated successfully. Please re-authenticate." };
  },
};

export default authService;
