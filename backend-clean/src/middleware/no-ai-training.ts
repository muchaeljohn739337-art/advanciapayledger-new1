// ============================================================================
// NO AI TRAINING MIDDLEWARE
// ============================================================================

import { Request, Response, NextFunction } from 'express';

export const noAITraining = (req: Request, res: Response, next: NextFunction) => {
  // Set headers to prevent AI training
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noai, noimageai');
  res.setHeader('Permissions-Policy', 'ai=(), camera=(), microphone=()');
  
  // Add custom headers for AI training prevention
  res.setHeader('X-AI-Training', 'disabled');
  res.setHeader('X-Data-Collection', 'disabled');
  
  next();
};
