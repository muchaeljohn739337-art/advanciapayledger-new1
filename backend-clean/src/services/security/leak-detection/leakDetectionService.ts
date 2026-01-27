import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface LeakDetectionRule {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: 'log' | 'alert' | 'block';
}

interface LeakReport {
  id: string;
  timestamp: Date;
  rule: LeakDetectionRule;
  location: string;
  content: string;
  context: string;
  severity: string;
}

class LeakDetectionService {
  private static instance: LeakDetectionService;
  private rules: LeakDetectionRule[] = [];
  private reports: LeakReport[] = [];
  private isScanning = false;

  static getInstance(): LeakDetectionService {
    if (!LeakDetectionService.instance) {
      LeakDetectionService.instance = new LeakDetectionService();
    }
    return LeakDetectionService.instance;
  }

  constructor() {
    this.initializeRules();
    this.startContinuousScanning();
  }

  private initializeRules() {
    this.rules = [
      {
        id: 'api_keys',
        name: 'API Keys',
        pattern: /(sk-[a-zA-Z0-9]{24,}|ghp_[a-zA-Z0-9]{36}|xoxb-[0-9]{10,}-[a-zA-Z0-9]{24})/g,
        severity: 'critical',
        description: 'Detects API keys from various services',
        action: 'alert'
      },
      {
        id: 'private_keys',
        name: 'Private Keys',
        pattern: /-----BEGIN (RSA |OPENSSH |DSA |EC |PGP )?PRIVATE KEY-----/g,
        severity: 'critical',
        description: 'Detects private key headers',
        action: 'alert'
      },
      {
        id: 'passwords',
        name: 'Password Patterns',
        pattern: /(password|passwd|pwd)\s*[:=]\s*\S+/gi,
        severity: 'high',
        description: 'Detects password assignments',
        action: 'alert'
      },
      {
        id: 'database_urls',
        name: 'Database URLs',
        pattern: /(mysql|postgresql|mongodb):\/\/[^:]+:[^@]+@/g,
        severity: 'high',
        description: 'Detects database connection strings with credentials',
        action: 'alert'
      },
      {
        id: 'jwt_tokens',
        name: 'JWT Tokens',
        pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
        severity: 'medium',
        description: 'Detects JWT tokens',
        action: 'log'
      },
      {
        id: 'aws_keys',
        name: 'AWS Access Keys',
        pattern: /AKIA[0-9A-Z]{16}/g,
        severity: 'critical',
        description: 'Detects AWS access key IDs',
        action: 'alert'
      },
      {
        id: 'hex_secrets',
        name: 'Hexadecimal Secrets',
        pattern: /\b([a-fA-F0-9]{32,})\b/g,
        severity: 'medium',
        description: 'Detects long hexadecimal strings (potential secrets)',
        action: 'log'
      }
    ];
  }

  private startContinuousScanning() {
    setInterval(() => {
      if (!this.isScanning) {
        this.performFullScan();
      }
    }, 300000);
  }

  async performFullScan(): Promise<void> {
    if (this.isScanning) return;
    
    this.isScanning = true;
    console.log('🔍 Starting leak detection scan...');
    
    try {
      await this.scanDirectory('./src', ['.ts', '.js', '.tsx', '.jsx']);
      await this.scanDirectory('./', ['.env*', '.json', '.yml', '.yaml']);
      await this.scanGitHistory();
      
      console.log(`✅ Scan completed. Found ${this.reports.length} potential leaks`);
    } catch (error) {
      console.error('❌ Scan failed:', error);
    } finally {
      this.isScanning = false;
    }
  }

  private async scanDirectory(dir: string, extensions: string[]): Promise<void> {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        await this.scanDirectory(filePath, extensions);
      } else {
        const extension = path.extname(file);
        if (extensions.includes(extension) || extensions.some(ext => file.startsWith(ext.replace('*', '')))) {
          await this.scanFile(filePath);
        }
      }
    }
  }

  private async scanFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const rule of this.rules) {
        const matches = content.match(rule.pattern);
        if (matches) {
          for (const match of matches) {
            const report: LeakReport = {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              rule,
              location: filePath,
              content: match,
              context: this.getContext(content, match),
              severity: rule.severity
            };
            
            this.reports.push(report);
            
            if (rule.action === 'alert') {
              console.error(`🚨 SECRET LEAK DETECTED: ${rule.name} in ${filePath}`);
              console.error(`   Content: ${match.substring(0, 50)}...`);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to scan file ${filePath}:`, error);
    }
  }

  private getContext(content: string, match: string): string {
    const index = content.indexOf(match);
    const start = Math.max(0, index - 100);
    const end = Math.min(content.length, index + match.length + 100);
    
    return content.substring(start, end);
  }

  private async scanGitHistory(): Promise<void> {
    try {
      // Get recent commits
      const commits = this.execCommand('git log --oneline -10').split('\n');
      
      for (const commit of commits) {
        if (!commit.trim()) continue;
        
        const commitHash = commit.split(' ')[0];
        
        // Check commit message for secrets
        const commitMessage = this.execCommand(`git log --format=%B -n 1 ${commitHash}`);
        await this.checkContent(`commit:${commitHash}`, commitMessage);
        
        // Check files in commit
        const files = this.execCommand(`git diff-tree --no-commit-id --name-only -r ${commitHash}`).split('\n');
        
        for (const file of files) {
          if (!file.trim()) continue;
          
          try {
            const fileContent = this.execCommand(`git show ${commitHash}:${file}`);
            await this.checkContent(`commit:${commitHash}:${file}`, fileContent);
          } catch (error) {
            // File might not exist or be binary
          }
        }
      }
    } catch (error) {
      console.warn('Git history scan failed:', error);
    }
  }

  private execCommand(command: string): string {
    try {
      return require('child_process').execSync(command, { encoding: 'utf8' });
    } catch (error) {
      return '';
    }
  }

  private async checkContent(location: string, content: string): Promise<void> {
    for (const rule of this.rules) {
      const matches = content.match(rule.pattern);
      if (matches) {
        for (const match of matches) {
          const report: LeakReport = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            rule,
            location,
            content: match,
            context: this.getContext(content, match),
            severity: rule.severity
          };
          
          this.reports.push(report);
          
          if (rule.action === 'alert') {
            console.error(`🚨 SECRET LEAK DETECTED: ${rule.name} in ${location}`);
          }
        }
      }
    }
  }

  getReports(severity?: string): LeakReport[] {
    if (severity) {
      return this.reports.filter(report => report.severity === severity);
    }
    return this.reports;
  }

  getCriticalReports(): LeakReport[] {
    return this.reports.filter(report => report.severity === 'critical');
  }

  getHighReports(): LeakReport[] {
    return this.reports.filter(report => report.severity === 'high');
  }

  clearReports(): void {
    this.reports = [];
  }

  getScanStatus() {
    return {
      isScanning: this.isScanning,
      totalReports: this.reports.length,
      criticalReports: this.getCriticalReports().length,
      highReports: this.getHighReports().length,
      lastScan: this.reports.length > 0 ? this.reports[this.reports.length - 1].timestamp : null
    };
  }
}

export const leakDetectionService = LeakDetectionService.getInstance();
export default leakDetectionService;
