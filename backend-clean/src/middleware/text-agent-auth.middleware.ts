import { Request, Response, NextFunction } from 'express';
// Text Agent Authentication System - DISABLED BY CREATOR
// Reference Number: 123456789 - Creator maintains exclusive control

const TEXT_AGENT_CONFIG = {
  secretKey: "", // DISABLED - No external access
  allowedAgents: [], // DISABLED - No external agents
};

export const authenticateTextAgent = (req: any, res: any, next: any) => {
  console.log('🔒 Text Agent Authentication DISABLED - Creator control only');
  return res.status(403).json({ 
    error: 'External access disabled - Creator maintains control',
    message: 'This system is under creator exclusive control'
  });
};
    'internal-text-advisor',
    'policy-text-analyst',
    'trust-text-manager'
  ],
  agentCapabilities: {
    'cascade-text-agent': ['full_access', 'policy_creation', 'trust_management', 'home_protection'],
    'rockefeller-text-assistant': ['policy_view', 'calculation', 'illustration', 'readonly'],
    'internal-text-advisor': ['policy_advice', 'underwriting', 'risk_assessment'],
    'policy-text-analyst': ['policy_analysis', 'premium_calculation', 'risk_modeling'],
    'trust-text-manager': ['trust_creation', 'beneficiary_management', 'trust_administration']
  },
  internalNetworks: [
    '127.0.0.1',
    '::1',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ]
};

interface TextAgentRequest extends Request {
  textAgent?: {
    id: string;
    capabilities: string[];
    network: string;
    authenticated: boolean;
  };
}

export const authenticateTextAgent = (req: TextAgentRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Text agent token required',
        code: 'TEXT_AGENT_TOKEN_REQUIRED'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, TEXT_AGENT_CONFIG.secretKey) as any;
    
    // Check if agent is allowed
    if (!TEXT_AGENT_CONFIG.allowedAgents.includes(decoded.agentId)) {
      return res.status(403).json({
        success: false,
        error: 'Text agent not authorized',
        code: 'TEXT_AGENT_NOT_AUTHORIZED'
      });
    }

    // Check network access
    const isInternalNetwork = TEXT_AGENT_CONFIG.internalNetworks.some(network => {
      if (network.includes('/')) {
        // CIDR notation check
        return isInNetwork(clientIP, network);
      }
      return clientIP === network;
    });

    if (!isInternalNetwork) {
      return res.status(403).json({
        success: false,
        error: 'Text agent network access denied',
        code: 'TEXT_AGENT_NETWORK_DENIED'
      });
    }

    // Attach agent info to request
    req.textAgent = {
      id: decoded.agentId,
      capabilities: TEXT_AGENT_CONFIG.agentCapabilities[decoded.agentId as keyof typeof TEXT_AGENT_CONFIG.agentCapabilities] || [],
      network: clientIP,
      authenticated: true
    };

    // Log text agent access
    console.log(`[TEXT_AGENT_AUTH] ${decoded.agentId} authenticated from ${clientIP}`);
    
    next();
  } catch (error) {
    console.error('[TEXT_AGENT_AUTH_ERROR]', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid text agent token',
      code: 'TEXT_AGENT_TOKEN_INVALID'
    });
  }
};

export const requireTextAgentCapability = (capability: string) => {
  return (req: TextAgentRequest, res: Response, next: NextFunction) => {
    if (!req.textAgent?.authenticated) {
      return res.status(401).json({
        success: false,
        error: 'Text agent authentication required',
        code: 'TEXT_AGENT_AUTH_REQUIRED'
      });
    }

    if (!req.textAgent.capabilities.includes(capability)) {
      return res.status(403).json({
        success: false,
        error: `Text agent capability '${capability}' required`,
        code: 'TEXT_AGENT_CAPABILITY_REQUIRED'
      });
    }

    next();
  };
};

export const logTextAgentActivity = (req: TextAgentRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - start;
    
    console.log(`[TEXT_AGENT_ACTIVITY] ${req.textAgent?.id} ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    
    // Log sensitive operations
    if (req.path.includes('/policy') || req.path.includes('/trust')) {
      console.log(`[TEXT_AGENT_SENSITIVE] ${req.textAgent?.id} accessed ${req.path}`);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Helper function for CIDR network checking
function isInNetwork(ip: string, network: string): boolean {
  const [networkAddress, prefixLength] = network.split('/');
  const networkParts = networkAddress.split('.').map(Number);
  const ipParts = ip.split('.').map(Number);
  
  const mask = (0xFFFFFFFF << (32 - parseInt(prefixLength))) >>> 0;
  const networkNum = (networkParts[0] << 24 | networkParts[1] << 16 | networkParts[2] << 8 | networkParts[3]) >>> 0;
  const ipNum = (ipParts[0] << 24 | ipParts[1] << 16 | ipParts[2] << 8 | ipParts[3]) >>> 0;
  
  return (networkNum & mask) === (ipNum & mask);
}

export default {
  authenticateTextAgent,
  requireTextAgentCapability,
  logTextAgentActivity
};
