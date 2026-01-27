/**
 * Advancia Pay Ledger Security Service
 * 
 * Master security service using the Advancia Pay Ledger key for:
 * - API authentication
 * - Webhook verification
 * - Data encryption/decryption
 * - Token generation
 */

import crypto from 'crypto';

export class AdvanciaSecurityService {
  private readonly apiKey: string;
  private readonly masterKey: string;
  private readonly webhookSecret: string;
  private readonly algorithm = 'aes-256-gcm';

  constructor() {
    this.apiKey = process.env.ADVANCIA_API_KEY || '';
    this.masterKey = process.env.ADVANCIA_MASTER_KEY || '';
    this.webhookSecret = process.env.ADVANCIA_WEBHOOK_SECRET || '';

    if (!this.apiKey || !this.masterKey) {
      console.log('⚠️ Advancia Security Service not fully configured - missing master keys');
    }
  }

  /**
   * Check if security service is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.masterKey && this.webhookSecret);
  }

  /**
   * Verify API key for authentication
   */
  verifyApiKey(providedKey: string): boolean {
    return providedKey === this.apiKey;
  }

  /**
   * Generate secure API token
   */
  generateApiToken(payload: any, expiresIn: number = 3600): string {
    if (!this.isConfigured()) {
      throw new Error('Security service not configured');
    }

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.masterKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verify API token
   */
  verifyApiToken(token: string): any {
    if (!this.isConfigured()) {
      throw new Error('Security service not configured');
    }

    try {
      const [header, payload, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.masterKey)
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
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    if (!this.isConfigured()) {
      throw new Error('Security service not configured');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(this.algorithm, this.masterKey, iv);
    cipher.setAAD(Buffer.from('advancia-payledger', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string, iv: string, tag: string): string {
    if (!this.isConfigured()) {
      throw new Error('Security service not configured');
    }

    const decipher = crypto.createDecipherGCM(this.algorithm, this.masterKey, Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from('advancia-payledger', 'utf8'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.isConfigured()) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate webhook signature
   */
  generateWebhookSignature(payload: string): string {
    if (!this.isConfigured()) {
      throw new Error('Security service not configured');
    }

    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Hash password securely
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const saltValue = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, saltValue, 100000, 64, 'sha512')
      .toString('hex');

    return { hash, salt: saltValue };
  }

  /**
   * Verify password
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const hashVerify = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(hashVerify, 'hex')
    );
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create API key for external services
   */
  createExternalApiKey(service: string, permissions: string[]): string {
    const payload = {
      service,
      permissions,
      type: 'external_api',
      created: new Date().toISOString()
    };

    return this.generateApiToken(payload, 86400 * 30); // 30 days
  }

  /**
   * Validate external API key
   */
  validateExternalApiKey(key: string, requiredPermission: string): boolean {
    try {
      const payload = this.verifyApiToken(key);
      
      if (payload.type !== 'external_api') {
        return false;
      }

      return payload.permissions.includes(requiredPermission);
    } catch {
      return false;
    }
  }
}

export const advanciaSecurityService = new AdvanciaSecurityService();
