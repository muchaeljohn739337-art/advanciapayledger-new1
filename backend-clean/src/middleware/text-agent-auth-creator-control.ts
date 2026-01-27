// Text Agent Authentication System - DISABLED BY CREATOR
// Reference Number: 123456789 - Creator maintains exclusive control

import { Request, Response, NextFunction } from 'express';

const TEXT_AGENT_CONFIG = {
  secretKey: "", // DISABLED - No external access
  allowedAgents: [], // DISABLED - No external agents
};

export const authenticateTextAgent = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔒 Text Agent Authentication DISABLED - Creator control only');
  return res.status(403).json({ 
    error: 'External access disabled - Creator maintains control',
    message: 'This system is under creator exclusive control'
  });
};
