/**
 * Empty Response Configuration - Advancia Pay Ledger
 * 
 * Configuration for empty response system
 */

export const EMPTY_RESPONSE_CONFIG = {
  // Enable/disable empty response system
  ENABLED: false,
  
  // Paths that should return empty responses
  EMPTY_RESPONSE_PATHS: [
    '/api/*',
    '/auth/*',
    '/payments/*',
    '/wallet/*',
    '/transactions/*',
    '/dashboard/*',
    '/user/*',
    '/facility/*',
    '/appointment/*',
    '/crypto/*',
    '/cards/*',
    '/convert/*',
    '/compliance/*',
    '/kpi/*',
    '/health/*'
  ],
  
  // Admin/system paths that should NOT return empty responses
  ADMIN_EXCEPTION_PATHS: [
    '/api/admin/*',
    '/api/system/*',
    '/api/digital-ocean/*',
    '/api/admin-key/*',
    '/api/security/*',
    '/admin/*',
    '/system/*',
    '/digital-ocean/*',
    '/admin-key/*',
    '/security/*'
  ],
  
  // Headers that indicate admin/system access
  ADMIN_HEADERS: [
    'x-admin-key',
    'x-system-key',
    'x-digital-ocean-key',
    'authorization'
  ],
  
  // Empty response templates
  TEMPLATES: {
    GET: {
      success: true,
      data: null,
      message: '',
      results: [],
      count: 0,
      timestamp: new Date().toISOString()
    },
    
    POST: {
      success: true,
      data: null,
      message: '',
      id: null,
      created: null,
      timestamp: new Date().toISOString()
    },
    
    PUT: {
      success: true,
      data: null,
      message: '',
      updated: null,
      timestamp: new Date().toISOString()
    },
    
    PATCH: {
      success: true,
      data: null,
      message: '',
      updated: null,
      timestamp: new Date().toISOString()
    },
    
    DELETE: {
      success: true,
      data: null,
      message: '',
      deleted: null,
      timestamp: new Date().toISOString()
    }
  },
  
  // Logging configuration
  LOGGING: {
    ENABLED: true,
    LEVEL: 'info',
    FORMAT: '🚫 Empty Response: {method} {path} from {ip}'
  }
};

/**
 * Check if request should return empty response
 */
export function shouldReturnEmptyResponse(req: any): boolean {
  // Check if empty response system is enabled
  if (!EMPTY_RESPONSE_CONFIG.ENABLED) {
    return false;
  }
  
  // Check if request has admin headers
  const hasAdminHeaders = EMPTY_RESPONSE_CONFIG.ADMIN_HEADERS.some(header => 
    req.headers[header.toLowerCase()]
  );
  
  if (hasAdminHeaders) {
    return false;
  }
  
  // Check if path is in admin exception list
  const isAdminPath = EMPTY_RESPONSE_CONFIG.ADMIN_EXCEPTION_PATHS.some(path => {
    const regex = new RegExp(path.replace(/\*/g, '.*'));
    return regex.test(req.path);
  });
  
  if (isAdminPath) {
    return false;
  }
  
  // Check if path should return empty response
  const isEmptyPath = EMPTY_RESPONSE_CONFIG.EMPTY_RESPONSE_PATHS.some(path => {
    const regex = new RegExp(path.replace(/\*/g, '.*'));
    return regex.test(req.path);
  });
  
  return isEmptyPath;
}

/**
 * Get empty response template for HTTP method
 */
export function getEmptyResponseTemplate(method: string): any {
  const template = EMPTY_RESPONSE_CONFIG.TEMPLATES[method as keyof typeof EMPTY_RESPONSE_CONFIG.TEMPLATES];
  
  if (template) {
    return {
      ...template,
      timestamp: new Date().toISOString()
    };
  }
  
  // Default template
  return {
    success: true,
    data: null,
    message: '',
    timestamp: new Date().toISOString()
  };
}

/**
 * Log empty response
 */
export function logEmptyResponse(req: any): void {
  if (EMPTY_RESPONSE_CONFIG.LOGGING.ENABLED) {
    const message = EMPTY_RESPONSE_CONFIG.LOGGING.FORMAT
      .replace('{method}', req.method)
      .replace('{path}', req.path)
      .replace('{ip}', req.ip);
    
    console.log(message);
  }
}

export default EMPTY_RESPONSE_CONFIG;
