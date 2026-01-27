import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'fallback-secret';
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.ACCESS_TOKEN_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.REFRESH_TOKEN_SECRET) as TokenPayload;
  }

  static async invalidateUserTokens(userId: string): Promise<void> {
    // In a real implementation, you would store tokens in a blacklist
    // For now, we'll just log the action
    console.log(`Invalidating tokens for user ${userId}`);
  }
}

export default TokenService;
