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
      userId: string;
      id?: string;
      email: string;
      role: string;
      status?: string;
    };

    admin?: {
      level: 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM_ADMIN';
      permissions: string[];
      key: string;
      authenticated: boolean;
    };
    adminToken?: string;
  }
}
