import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
      resetTime: Date;
    };
    clientIP?: string;
    realIP?: string;
    geoLocation?: {
      country?: string;
      city?: string;
      region?: string;
      latitude?: number;
      longitude?: number;
    };
    user?: {
      id: string;
      email: string;
      role: string;
      status: string;
    };
  }
}
