import { Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { signRefreshToken, signToken, verifyToken } from "../utils/jwt";
import {
  comparePassword,
  hashPassword,
  validatePassword,
} from "../utils/password";
import { emailService } from "../services/emailService";
import { adminNotificationService } from "../services/adminNotification.service";
import { blacklistToken, isBlacklisted } from "../utils/tokenBlacklist";
import crypto from "crypto";
import { logger } from "../lib/logger";

const router = Router();

// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: "Email, password, first name, and last name are required" });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email format" });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: "User already exists with this email" });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    // Create user with PENDING_APPROVAL status
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: "USER",
        status: "PENDING_APPROVAL",
        emailVerified: false,
        emailVerificationToken,
      },
    });

    // Send welcome email with verification link
    try {
      await emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );
      logger.info(`[REGISTRATION] Welcome email sent to ${user.email}`);
    } catch (emailError) {
      logger.error("[REGISTRATION] Failed to send welcome email:", emailError);
      // Don't fail registration if email fails
    }

    // Notify admins about new registration
    try {
      await adminNotificationService.notifyNewRegistration(user.id);
      logger.info(`[REGISTRATION] Admin notification sent for ${user.email}`);
    } catch (notifyError) {
      logger.error("[REGISTRATION] Failed to notify admins:", notifyError);
      // Don't fail registration if notification fails
    }

    // Return user without password
    const { password: _, emailVerificationToken: __, ...userWithoutPassword } = user;
    res.status(201).json({
      message: "Registration successful! Please check your email for verification instructions.",
      user: userWithoutPassword,
      requiresApproval: true,
    });
  } catch (error: any) {
    logger.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check user status for admin approval
    if (user.status === "PENDING_APPROVAL") {
      res.status(403).json({ 
        error: "Your account is pending admin approval. You'll receive an email once approved.",
        code: "PENDING_APPROVAL"
      });
      return;
    }

    if (user.status === "REJECTED") {
      res.status(403).json({ 
        error: "Your account registration was not approved. Please contact support.",
        code: "REJECTED"
      });
      return;
    }

    if (user.status === "SUSPENDED") {
      res.status(403).json({ 
        error: "Your account has been suspended. Please contact support.",
        code: "SUSPENDED"
      });
      return;
    }

    if (user.status !== "ACTIVE") {
      res.status(403).json({ error: "Account not active" });
      return;
    }

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(403).json({ 
        error: "Please verify your email address. Check your inbox for the verification link.",
        code: "EMAIL_NOT_VERIFIED"
      });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Return tokens and user
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: "Login successful",
      token: accessToken,
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    logger.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    // Reject blacklisted refresh tokens (i.e., after logout)
    if (isBlacklisted(refreshToken)) {
      res.status(401).json({ error: "Refresh token has been revoked" });
      return;
    }

    // Verify refresh token
    const payload = verifyToken(refreshToken);

    // Generate new access token
    const newAccessToken = signToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// Logout — revoke both access and refresh tokens so neither can be reused
router.post(
  "/logout",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      // Blacklist the access token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const payload = verifyToken(token);
          const expiry = (payload as any).exp ?? Math.floor(Date.now() / 1000) + 86400;
          blacklistToken(token, expiry);
        } catch { /* already invalid */ }
      }

      // Blacklist the refresh token if supplied
      const { refreshToken } = req.body;
      if (refreshToken) {
        try {
          const refreshPayload = verifyToken(refreshToken);
          const refreshExpiry = (refreshPayload as any).exp ?? Math.floor(Date.now() / 1000) + 7 * 86400;
          blacklistToken(refreshToken, refreshExpiry);
        } catch { /* already invalid or expired */ }
      }

      res.json({ message: "Logout successful" });
    } catch (error: any) {
      // Even on error, report success — token is already considered invalid
      res.json({ message: "Logout successful" });
    }
  }
);

// Get current user
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error: any) {
    logger.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Reset password request
router.post("/reset-password-request", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always respond immediately (don't reveal whether user exists)
    res.json({ message: "If the email exists, a reset link will be sent" });

    // Fire-and-forget after response to avoid timing leaks
    if (user && user.status === "ACTIVE") {
      try {
        // Generate a short-lived signed JWT (1 hour) as the reset token
        const resetToken = signToken(
          { userId: user.id, email: user.email, role: user.role },
          '1h'
        );

        await emailService.sendPasswordResetEmail(user.email, resetToken);
        logger.info(`[AUTH] Password reset email sent to ${user.email}`);
      } catch (emailError) {
        logger.error("[AUTH] Failed to send password reset email:", emailError);
      }
    }
  } catch (error: any) {
    // Response already sent above; log internally
    logger.error("[AUTH] reset-password-request error:", error);
  }
});

// Reset password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
      return;
    }

    // Verify reset token (throws if expired/invalid)
    const payload = verifyToken(token);

    // Reject if token was already used
    if (isBlacklisted(token)) {
      res.status(400).json({ error: "Reset link has already been used" });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        password: hashedPassword,
      },
    });

    // Immediately invalidate the reset token so it cannot be replayed
    const expiry = (payload as any).exp ?? Math.floor(Date.now() / 1000) + 3600;
    blacklistToken(token, expiry);

    res.json({ message: "Password reset successful" });
  } catch (error: any) {
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
});

// Verify email
router.get("/verify-email/:token", async (req: Request, res: Response) => {
  try {
    const token = Array.isArray(req.params.token)
      ? req.params.token[0]
      : req.params.token;

    if (!token) {
      res.status(400).json({ error: "Verification token is required" });
      return;
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      res.status(404).json({ error: "Invalid or expired verification token" });
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      res.json({ 
        message: "Email already verified",
        alreadyVerified: true 
      });
      return;
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
      },
    });

    res.json({ 
      message: "Email verified successfully!",
      success: true 
    });
  } catch (error: any) {
    logger.error("Email verification error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      res.json({ message: "If the email exists, a verification link will be sent" });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken },
    });

    // Send verification email
    try {
      await emailService.sendWelcomeEmail(user.email, user.firstName, emailVerificationToken);
      logger.info(`[VERIFICATION] Resent verification email to ${user.email}`);
    } catch (emailError) {
      logger.error("[VERIFICATION] Failed to send email:", emailError);
    }

    res.json({ message: "Verification email sent successfully" });
  } catch (error: any) {
    logger.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

export default router;
