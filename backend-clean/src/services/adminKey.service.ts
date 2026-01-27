/**
 * Admin Key Service - Advancia Pay Ledger
 * 
 * Admin key authentication and authorization service
 */

export class AdminKeyService {
  private readonly adminApiKey: string;
  private readonly superAdminKey: string;
  private readonly systemAdminKey: string;

  constructor() {
    this.adminApiKey = process.env.ADMIN_API_KEY || '';
    this.superAdminKey = process.env.SUPER_ADMIN_KEY || '';
    this.systemAdminKey = process.env.SYSTEM_ADMIN_KEY || '';

    if (!this.adminApiKey || !this.superAdminKey || !this.systemAdminKey) {
      console.log('⚠️ Admin Key Service not fully configured - missing admin keys');
    }
  }

  /**
   * Check if admin key service is configured
   */
  isConfigured(): boolean {
    return !!(this.adminApiKey && this.superAdminKey && this.systemAdminKey);
  }

  /**
   * Verify admin API key
   */
  verifyAdminKey(providedKey: string): boolean {
    return providedKey === this.adminApiKey;
  }

  /**
   * Verify super admin API key
   */
  verifySuperAdminKey(providedKey: string): boolean {
    return providedKey === this.superAdminKey;
  }

  /**
   * Verify system admin API key
   */
  verifySystemAdminKey(providedKey: string): boolean {
    return providedKey === this.systemAdminKey;
  }

  /**
   * Check if key has admin privileges
   */
  hasAdminPrivileges(key: string): boolean {
    return this.verifyAdminKey(key) || 
           this.verifySuperAdminKey(key) || 
           this.verifySystemAdminKey(key);
  }

  /**
   * Check if key has super admin privileges
   */
  hasSuperAdminPrivileges(key: string): boolean {
    return this.verifySuperAdminKey(key) || this.verifySystemAdminKey(key);
  }

  /**
   * Check if key has system admin privileges
   */
  hasSystemAdminPrivileges(key: string): boolean {
    return this.verifySystemAdminKey(key);
  }

  /**
   * Get admin level from key
   */
  getAdminLevel(key: string): 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM_ADMIN' | 'INVALID' {
    if (this.verifySystemAdminKey(key)) return 'SYSTEM_ADMIN';
    if (this.verifySuperAdminKey(key)) return 'SUPER_ADMIN';
    if (this.verifyAdminKey(key)) return 'ADMIN';
    return 'INVALID';
  }

  /**
   * Get permissions for admin level
   */
  getPermissions(level: 'ADMIN' | 'SUPER_ADMIN' | 'SYSTEM_ADMIN'): string[] {
    switch (level) {
      case 'ADMIN':
        return [
          'read_users',
          'read_transactions',
          'read_reports',
          'manage_own_profile',
          'view_dashboard'
        ];
      case 'SUPER_ADMIN':
        return [
          'read_users',
          'write_users',
          'delete_users',
          'read_transactions',
          'write_transactions',
          'delete_transactions',
          'read_reports',
          'write_reports',
          'manage_payments',
          'manage_security',
          'view_dashboard',
          'manage_system_settings'
        ];
      case 'SYSTEM_ADMIN':
        return [
          'ALL' // Complete system access
        ];
      default:
        return [];
    }
  }

  /**
   * Generate admin token
   */
  generateAdminToken(key: string, expiresIn: number = 3600): string {
    const level = this.getAdminLevel(key);
    if (level === 'INVALID') {
      throw new Error('Invalid admin key');
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      adminLevel: level,
      permissions: this.getPermissions(level),
      iat: now,
      exp: now + expiresIn,
      type: 'admin_token'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = require('crypto')
      .createHmac('sha256', process.env.JWT_SECRET || 'default-secret')
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify admin token
   */
  verifyAdminToken(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');
      
      const expectedSignature = require('crypto')
        .createHmac('sha256', process.env.JWT_SECRET || 'default-secret')
        .update(`${header}.${payload}`)
        .digest('base64url');

      if (signature !== expectedSignature) {
        throw new Error('Invalid token signature');
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
      
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return decodedPayload;
    } catch (error) {
      throw new Error(`Admin token verification failed: ${error.message}`);
    }
  }

  /**
   * Check if admin has specific permission
   */
  hasPermission(key: string, permission: string): boolean {
    const level = this.getAdminLevel(key);
    if (level === 'INVALID') return false;
    
    const permissions = this.getPermissions(level);
    return permissions.includes('ALL') || permissions.includes(permission);
  }

  /**
   * Log admin action
   */
  logAdminAction(key: string, action: string, resource: string, details?: any): void {
    const level = this.getAdminLevel(key);
    console.log(`[ADMIN] ${level} - ${action} on ${resource}`, {
      timestamp: new Date().toISOString(),
      level,
      action,
      resource,
      details
    });
  }

  /**
   * Get admin key info (for debugging)
   */
  getAdminKeyInfo(): {
    configured: boolean;
    adminKeyLength: number;
    superAdminKeyLength: number;
    systemAdminKeyLength: number;
  } {
    return {
      configured: this.isConfigured(),
      adminKeyLength: this.adminApiKey.length,
      superAdminKeyLength: this.superAdminKey.length,
      systemAdminKeyLength: this.systemAdminKey.length
    };
  }
}

export const adminKeyService = new AdminKeyService();
