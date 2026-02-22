import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface SecurityConfig {
  encryption: {
    algorithm: string;
    keySize: number;
    ivSize: number;
    saltSize: number;
    iterations: number;
  };
  secrets: {
    rotationInterval: number;
    maxAge: number;
    auditLog: boolean;
    leakDetection: boolean;
  };
  ai: {
    agentRestrictions: boolean;
    llmSafeguards: boolean;
    promptFiltering: boolean;
    responseSanitization: boolean;
  };
  monitoring: {
    anomalyDetection: boolean;
    behaviorAnalysis: boolean;
    alertThresholds: any;
  };
}

class SecurityConfigService {
  private static instance: SecurityConfigService;
  private config: SecurityConfig;
  private encryptionKey: Buffer;
  private secretsCache = new Map<string, any>();
  private auditLog: any[] = [];

  static getInstance(): SecurityConfigService {
    if (!SecurityConfigService.instance) {
      SecurityConfigService.instance = new SecurityConfigService();
    }
    return SecurityConfigService.instance;
  }

  constructor() {
    this.config = this.loadSecurityConfig();
    this.encryptionKey = this.generateEncryptionKey();
    this.initializeSecurity();
  }

  private loadSecurityConfig(): SecurityConfig {
    return {
      encryption: {
        algorithm: 'aes-256-gcm',
        keySize: 32,
        ivSize: 16,
        saltSize: 32,
        iterations: 100000
      },
      secrets: {
        rotationInterval: 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        auditLog: true,
        leakDetection: true
      },
      ai: {
        agentRestrictions: true,
        llmSafeguards: true,
        promptFiltering: true,
        responseSanitization: true
      },
      monitoring: {
        anomalyDetection: true,
        behaviorAnalysis: true,
        alertThresholds: {
          failedLogins: 5,
          dataExfiltration: 1000000,
          apiCalls: 1000,
          errorRate: 0.05
        }
      }
    };
  }

  private initializeSecurity() {
    this.startSecretRotation();
    this.initializeLeakDetection();
    this.initializeAISafeguards();
    this.startSecurityMonitoring();
  }

  private generateEncryptionKey(): Buffer {
    const key = process.env.MASTER_ENCRYPTION_KEY;
    if (key) {
      return Buffer.from(key, 'hex');
    }
    
    const newKey = crypto.randomBytes(32);
    console.log('🔑 Generated new encryption key. Save this securely:');
    console.log(newKey.toString('hex'));
    return newKey;
  }

  encrypt(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.config.encryption.ivSize);
    const cipher: any = crypto.createCipheriv(
      this.config.encryption.algorithm,
      this.encryptionKey,
      iv
    );
    cipher.setAAD(Buffer.from('advancia-pay-ledger'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher: any = crypto.createDecipheriv(
      this.config.encryption.algorithm,
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAAD(Buffer.from('advancia-pay-ledger'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  storeSecret(key: string, value: any): void {
    const encrypted = this.encrypt(JSON.stringify(value));
    this.secretsCache.set(key, encrypted);
    this.logSecurityEvent('secret_stored', { key, timestamp: new Date() });
  }

  getSecret(key: string): any {
    const encrypted = this.secretsCache.get(key);
    if (!encrypted) {
      throw new Error(`Secret not found: ${key}`);
    }
    
    const decrypted = this.decrypt(encrypted);
    this.logSecurityEvent('secret_accessed', { key, timestamp: new Date() });
    
    return JSON.parse(decrypted);
  }

  private startSecretRotation() {
    setInterval(() => {
      this.rotateSecrets();
    }, this.config.secrets.rotationInterval);
  }

  private rotateSecrets() {
    console.log('🔄 Rotating secrets...');
    
    this.encryptionKey = crypto.randomBytes(32);
    
    const oldSecrets = new Map(this.secretsCache);
    this.secretsCache.clear();
    
    for (const [key, encrypted] of oldSecrets) {
      const decrypted = this.decrypt(encrypted);
      const reencrypted = this.encrypt(decrypted);
      this.secretsCache.set(key, reencrypted);
    }
    
    this.logSecurityEvent('secrets_rotated', { timestamp: new Date() });
  }

  private initializeLeakDetection() {
    this.checkEnvironmentVariables();
    this.checkSensitiveFiles();
    this.checkLogsForSecrets();
  }

  private checkEnvironmentVariables() {
    const sensitivePatterns = [
      /password/i, /secret/i, /key/i, /token/i, /private/i
    ];
    
    for (const [key, value] of Object.entries(process.env)) {
      if (sensitivePatterns.some(pattern => pattern.test(key))) {
        if (value && value.length > 20) {
          console.warn(`⚠️ Potential secret in environment variable: ${key}`);
          this.logSecurityEvent('potential_secret_leak', { variable: key, timestamp: new Date() });
        }
      }
    }
  }

  private checkSensitiveFiles() {
    const sensitiveExtensions = ['.pem', '.key', '.p12', '.pfx'];
    const sensitiveNames = ['private', 'secret', 'key', 'password'];
    
    const checkDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          checkDirectory(filePath);
        } else {
          const hasSensitiveExtension = sensitiveExtensions.some(ext => file.endsWith(ext));
          const hasSensitiveName = sensitiveNames.some(name => file.toLowerCase().includes(name));
          
          if (hasSensitiveExtension || hasSensitiveName) {
            console.warn(`⚠️ Sensitive file detected: ${filePath}`);
            this.logSecurityEvent('sensitive_file_detected', { file: filePath, timestamp: new Date() });
          }
        }
      }
    };
    
    checkDirectory(process.cwd());
  }

  private checkLogsForSecrets() {
    const logFiles = ['app.log', 'error.log', 'access.log'];
    
    for (const logFile of logFiles) {
      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf8');
        
        const secretPatterns = [
          /[A-Za-z0-9]{32,}/g,
          /sk-[a-zA-Z0-9]{24,}/g,
          /ghp_[a-zA-Z0-9]{36}/g,
          /xoxb-[0-9]{10,}-[a-zA-Z0-9]{24}/g
        ];
        
        for (const pattern of secretPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            console.warn(`⚠️ Potential secrets found in log file: ${logFile}`);
            this.logSecurityEvent('secrets_in_logs', { file: logFile, matches: matches.length, timestamp: new Date() });
          }
        }
      }
    }
  }

  private initializeAISafeguards() {
    if (!this.config.ai.agentRestrictions) return;
    
    this.setupAIAgentRestrictions();
    this.setupLLMSafeguards();
  }

  private setupAIAgentRestrictions() {
    const allowedOperations = [
      'read_data', 'analyze_data', 'generate_report', 'send_notification', 'log_activity'
    ];
    
    const forbiddenOperations = [
      'delete_data', 'modify_system', 'access_secrets', 'execute_shell', 'modify_permissions', 'access_user_data'
    ];
    
    this.storeSecret('ai_allowed_operations', allowedOperations);
    this.storeSecret('ai_forbidden_operations', forbiddenOperations);
  }

  private setupLLMSafeguards() {
    const promptFilters = [
      /\b(password|secret|key|token)\b/i,
      /\b(admin|root|superuser)\b/i,
      /\b(delete|drop|remove)\b/i,
      /\b(system|config|settings)\b/i
    ];
    
    const responseFilters = [
      /\b(sk-[a-zA-Z0-9]{24,})\b/g,
      /\b([A-Za-z0-9]{32,})\b/g,
      /\b(ghp_[a-zA-Z0-9]{36})\b/g
    ];
    
    this.storeSecret('llm_prompt_filters', promptFilters);
    this.storeSecret('llm_response_filters', responseFilters);
  }

  validateAIAgentOperation(operation: string, context: any): { allowed: boolean; reason?: string } {
    const forbiddenOps = this.getSecret('ai_forbidden_operations');
    
    if (forbiddenOps.includes(operation)) {
      this.logSecurityEvent('ai_agent_operation_blocked', { operation, context, timestamp: new Date() });
      return { allowed: false, reason: 'Operation not allowed for AI agents' };
    }
    
    return { allowed: true };
  }

  filterLLMPrompt(prompt: string): { filtered: string; blocked: boolean; reason?: string } {
    if (!this.config.ai.promptFiltering) {
      return { filtered: prompt, blocked: false };
    }
    
    const filters = this.getSecret('llm_prompt_filters');
    let filteredPrompt = prompt;
    let blocked = false;
    let reason = '';
    
    for (const filter of filters) {
      if (filter.test(prompt)) {
        blocked = true;
        reason = 'Prompt contains sensitive content';
        filteredPrompt = prompt.replace(filter, '[REDACTED]');
        this.logSecurityEvent('llm_prompt_blocked', { original: prompt, filtered: filteredPrompt, timestamp: new Date() });
        break;
      }
    }
    
    return { filtered: filteredPrompt, blocked, reason };
  }

  sanitizeLLMResponse(response: string): string {
    if (!this.config.ai.responseSanitization) {
      return response;
    }
    
    const filters = this.getSecret('llm_response_filters');
    let sanitizedResponse = response;
    
    for (const filter of filters) {
      sanitizedResponse = sanitizedResponse.replace(filter, '[REDACTED]');
    }
    
    if (sanitizedResponse !== response) {
      this.logSecurityEvent('llm_response_sanitized', { timestamp: new Date() });
    }
    
    return sanitizedResponse;
  }

  private startSecurityMonitoring() {
    if (!this.config.monitoring.anomalyDetection) return;
    
    setInterval(() => {
      this.performSecurityCheck();
    }, 60000);
  }

  private performSecurityCheck() {
    this.checkForAnomalies();
    this.checkAuditLog();
    this.updateSecurityMetrics();
  }

  private checkForAnomalies() {
    const metrics = {
      failedLogins: this.getMetricCount('failed_login'),
      dataExfiltration: this.getMetricCount('data_exfiltration'),
      apiCalls: this.getMetricCount('api_call'),
      errors: this.getMetricCount('error')
    };
    
    const thresholds = this.config.monitoring.alertThresholds;
    
    if (metrics.failedLogins > thresholds.failedLogins) {
      this.triggerSecurityAlert('high_failed_logins', metrics);
    }
    
    if (metrics.dataExfiltration > thresholds.dataExfiltration) {
      this.triggerSecurityAlert('data_exfiltration_detected', metrics);
    }
  }

  private getMetricCount(metricType: string): number {
    const recentEvents = this.auditLog.filter(event => 
      event.type === metricType && 
      Date.now() - new Date(event.timestamp).getTime() < 300000
    );
    return recentEvents.length;
  }

  private triggerSecurityAlert(alertType: string, metrics: any) {
    console.error(`🚨 SECURITY ALERT: ${alertType}`, metrics);
    this.logSecurityEvent('security_alert', { alertType, metrics, timestamp: new Date() });
  }

  private checkAuditLog() {
    const recentEvents = this.auditLog.filter(event => 
      Date.now() - new Date(event.timestamp).getTime() < 3600000
    );
    
    const userActivity = new Map();
    for (const event of recentEvents) {
      const userId = event.userId || 'anonymous';
      userActivity.set(userId, (userActivity.get(userId) || 0) + 1);
    }
    
    for (const [userId, count] of userActivity) {
      if (count > 100) {
        this.triggerSecurityAlert('unusual_user_activity', { userId, count });
      }
    }
  }

  private updateSecurityMetrics() {
    const metrics = {
      totalEvents: this.auditLog.length,
      secretsStored: this.secretsCache.size,
      lastRotation: this.getLastSecretRotation(),
      alertsTriggered: this.getAlertCount()
    };
    
    this.storeSecret('security_metrics', metrics);
  }

  private getLastSecretRotation(): Date {
    const events = this.auditLog.filter(event => event.type === 'secrets_rotated');
    return events.length > 0 ? new Date(events[events.length - 1].timestamp) : new Date(0);
  }

  private getAlertCount(): number {
    return this.auditLog.filter(event => event.type === 'security_alert').length;
  }

  private logSecurityEvent(type: string, data: any) {
    const event = {
      type,
      data,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    this.auditLog.push(event);
    
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  getSecurityStatus() {
    return {
      config: this.config,
      metrics: this.getSecret('security_metrics'),
      recentAlerts: this.auditLog.filter(event => event.type === 'security_alert').slice(-10),
      lastAudit: this.auditLog[this.auditLog.length - 1]
    };
  }
}

export const securityConfigService = SecurityConfigService.getInstance();
export default securityConfigService;
