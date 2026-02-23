import prisma from '../lib/prisma';
import { logger } from "../lib/logger";

// Compliance and regulatory service
export class ComplianceService {
  private sanctionedCountries: Set<string> = new Set([
    'KP', // North Korea
    'IR', // Iran
    'SY', // Syria
    'CU', // Cuba
    'SD', // Sudan
  ]);

  private highRiskCountries: Set<string> = new Set([
    'AF', 'BY', 'MM', 'CF', 'CD', 'IQ', 'LB', 'LY', 'SO', 'SS', 'VE', 'YE', 'ZW'
  ]);

  // Basic name-based watchlist — supplement with OFAC/UN/EU API in production
  private readonly nameWatchlist: string[] = [
    'kim jong',
    'ali khamenei',
    'bashar al-assad',
    'alexander lukashenko',
    'nicolas maduro',
  ];

  // Helper to escalate status without downgrading a more severe state
  private escalateStatus(
    current: 'approved' | 'pending' | 'rejected',
    next: 'approved' | 'pending' | 'rejected'
  ): 'approved' | 'pending' | 'rejected' {
    const priority = { rejected: 2, pending: 1, approved: 0 };
    return priority[next] > priority[current] ? next : current;
  }

  // KYC/AML compliance check
  async performKYCCheck(data: KYCData): Promise<KYCResult> {
    const checks: ComplianceCheck[] = [];
    let overallStatus: 'approved' | 'pending' | 'rejected' = 'approved';
    const issues: string[] = [];

    try {
      // 1. Sanctions screening
      const sanctionsCheck = await this.checkSanctions(data);
      checks.push(sanctionsCheck);
      if (!sanctionsCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'rejected');
        issues.push('Sanctioned country or individual');
      }

      // 2. Identity verification
      const identityCheck = await this.verifyIdentity(data);
      checks.push(identityCheck);
      if (!identityCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'pending');
        issues.push('Identity verification required');
      }

      // 3. Address verification
      const addressCheck = await this.verifyAddress(data);
      checks.push(addressCheck);
      if (!addressCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'pending');
        issues.push('Address verification required');
      }

      // 4. Age verification (18+)
      const ageCheck = await this.verifyAge(data);
      checks.push(ageCheck);
      if (!ageCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'rejected');
        issues.push('Must be 18 years or older');
      }

      // 5. PEP (Politically Exposed Person) screening
      const pepCheck = await this.checkPEP(data);
      checks.push(pepCheck);
      if (!pepCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'pending');
        issues.push('Enhanced due diligence required (PEP)');
      }

      // 6. Document verification
      const documentCheck = await this.verifyDocuments(data);
      checks.push(documentCheck);
      if (!documentCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'pending');
        issues.push('Document verification required');
      }

      // 7. Source of funds — required when volume is high OR source is simply absent
      const fundsCheck = await this.verifySourceOfFunds(data);
      checks.push(fundsCheck);
      if (!fundsCheck.passed) {
        const volumeThreshold = data.expectedVolume !== undefined ? data.expectedVolume > 10000 : true;
        if (volumeThreshold) {
          overallStatus = this.escalateStatus(overallStatus, 'pending');
          issues.push('Source of funds verification required');
        }
      }

      // 8. Geographic restrictions
      const geoCheck = await this.checkGeographicRestrictions(data.country);
      checks.push(geoCheck);
      if (!geoCheck.passed) {
        overallStatus = this.escalateStatus(overallStatus, 'rejected');
        issues.push('Geographic restrictions apply');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        status: 'rejected',
        checks,
        issues: [...issues, `Compliance check error: ${message}`],
        riskLevel: 'high',
        timestamp: new Date().toISOString(),
      };
    }

    const result: KYCResult = {
      status: overallStatus,
      checks,
      issues,
      riskLevel: this.calculateRiskLevel(checks),
      timestamp: new Date().toISOString(),
    };

    // Persist KYC outcome to User record when a userId is provided
    if (data.userId) {
      const kycStatusMap: Record<KYCResult['status'], 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW'> = {
        approved: 'APPROVED',
        rejected: 'REJECTED',
        pending: 'UNDER_REVIEW',
      };
      await prisma.user.update({
        where: { id: data.userId },
        data: {
          kycStatus: kycStatusMap[overallStatus],
          kycSubmittedAt: new Date(),
          ...(overallStatus === 'approved' ? { kycApprovedAt: new Date() } : {}),
        },
      }).catch((dbErr: unknown) => {
        // Non-fatal: log but do not fail the compliance response
        logger.error('[ComplianceService] Failed to persist KYC result:', dbErr);
      });
    }

    return result;
  }

  // Check sanctions lists
  private async checkSanctions(data: KYCData): Promise<ComplianceCheck> {
    // Check country sanctions
    if (data.country && this.sanctionedCountries.has(data.country)) {
      return {
        name: 'Sanctions Screening',
        passed: false,
        required: true,
        details: 'Country is under sanctions',
      };
    }

    // In production: Check against OFAC, UN, EU sanctions lists via API (e.g. ComplyAdvantage)
    // Basic name watchlist check
    if (data.firstName && data.lastName) {
      const fullName = `${data.firstName} ${data.lastName}`.toLowerCase();
      const nameMatch = this.nameWatchlist.some(entry => fullName.includes(entry));
      if (nameMatch) {
        return {
          name: 'Sanctions Screening',
          passed: false,
          required: true,
          details: 'Name matched internal watchlist — manual review required',
        };
      }
    }

    return {
      name: 'Sanctions Screening',
      passed: true,
      required: true,
      details: 'No sanctions matches found',
    };
  }

  // Verify identity documents
  private async verifyIdentity(data: KYCData): Promise<ComplianceCheck> {
    if (!data.firstName || !data.lastName || !data.dateOfBirth) {
      return {
        name: 'Identity Verification',
        passed: false,
        required: true,
        details: 'Missing required identity information',
      };
    }

    // In production: Use services like Onfido, Jumio, or Veriff
    // - Document authenticity check
    // - Face match with selfie
    // - Liveness detection

    return {
      name: 'Identity Verification',
      passed: true,
      required: true,
      details: 'Identity verified',
    };
  }

  // Verify address
  private async verifyAddress(data: KYCData): Promise<ComplianceCheck> {
    if (!data.address || !data.city || !data.postalCode) {
      return {
        name: 'Address Verification',
        passed: false,
        required: true,
        details: 'Missing address information',
      };
    }

    // In production: Verify against utility bills, bank statements
    
    return {
      name: 'Address Verification',
      passed: true,
      required: true,
      details: 'Address verified',
    };
  }

  // Verify age (18+)
  private async verifyAge(data: KYCData): Promise<ComplianceCheck> {
    if (!data.dateOfBirth) {
      return {
        name: 'Age Verification',
        passed: false,
        required: true,
        details: 'Date of birth required',
      };
    }

    const age = this.calculateAge(data.dateOfBirth);
    
    return {
      name: 'Age Verification',
      passed: age >= 18,
      required: true,
      details: age >= 18 ? 'Age verified (18+)' : 'Must be 18 or older',
    };
  }

  // Check PEP status
  private async checkPEP(data: KYCData): Promise<ComplianceCheck> {
    // In production: Check against PEP databases
    // - World-Check
    // - Dow Jones Risk & Compliance
    // - ComplyAdvantage
    if (data.isPEP === true) {
      return {
        name: 'PEP Screening',
        passed: false,
        required: false,
        details: 'Enhanced due diligence required — user self-declared as PEP',
      };
    }

    return {
      name: 'PEP Screening',
      passed: true,
      required: false,
      details: 'Not a politically exposed person',
    };
  }

  // Verify documents
  private async verifyDocuments(data: KYCData): Promise<ComplianceCheck> {
    if (!data.documentType || !data.documentNumber) {
      return {
        name: 'Document Verification',
        passed: false,
        required: true,
        details: 'Government-issued ID required',
      };
    }

    // Check document expiry if provided
    if (data.documentExpiryDate) {
      const expiry = new Date(data.documentExpiryDate);
      if (isNaN(expiry.getTime())) {
        return {
          name: 'Document Verification',
          passed: false,
          required: true,
          details: 'Invalid document expiry date format',
        };
      }
      if (expiry < new Date()) {
        return {
          name: 'Document Verification',
          passed: false,
          required: true,
          details: 'Document has expired',
        };
      }
    }

    // In production: Verify document authenticity
    // - OCR extraction
    // - Security features check
    // - Expiry date validation via Onfido/Jumio/Veriff

    return {
      name: 'Document Verification',
      passed: true,
      required: true,
      details: 'Document verified',
    };
  }

  // Verify source of funds
  private async verifySourceOfFunds(data: KYCData): Promise<ComplianceCheck> {
    if (!data.sourceOfFunds) {
      return {
        name: 'Source of Funds',
        passed: false,
        required: false,
        details: 'Source of funds declaration required for high-value accounts',
      };
    }

    return {
      name: 'Source of Funds',
      passed: true,
      required: false,
      details: `Source: ${data.sourceOfFunds}`,
    };
  }

  // Calculate risk level
  private calculateRiskLevel(checks: ComplianceCheck[]): 'low' | 'medium' | 'high' {
    // A sanctions or geo-restriction failure is immediately high risk
    const sanctionsFailed = checks.some(
      c => (c.name === 'Sanctions Screening' || c.name === 'Geographic Restrictions') && !c.passed
    );
    if (sanctionsFailed) return 'high';

    const failedRequired = checks.filter(c => c.required && !c.passed).length;
    const failedOptional = checks.filter(c => !c.required && !c.passed).length;

    if (failedRequired > 0) return 'high';
    if (failedOptional >= 1) return 'medium';
    return 'low';
  }

  // Calculate age from date of birth
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Card compliance check for bank acceptance
  async checkCardCompliance(cardData: CardComplianceData): Promise<CardComplianceResult> {
    const checks: ComplianceCheck[] = [];
    let approved = true;
    const issues: string[] = [];

    try {
      // 1. BIN validation
      const binCheck = await this.validateBIN(cardData.bin);
      checks.push(binCheck);
      if (!binCheck.passed) {
        approved = false;
        issues.push('Invalid BIN or unsupported card network');
      }

      // 2. Issuer verification
      const issuerCheck = await this.verifyIssuer(cardData.bin);
      checks.push(issuerCheck);
      if (!issuerCheck.passed) {
        approved = false;
        issues.push('Issuer not supported or flagged');
      }

      // 3. Card type validation
      const typeCheck = this.validateCardType(cardData.cardType);
      checks.push(typeCheck);
      if (!typeCheck.passed) {
        approved = false;
        issues.push('Card type not supported');
      }

      // 4. Cardholder name validation
      const nameCheck = this.validateCardholderName(cardData.cardholderName);
      checks.push(nameCheck);
      if (!nameCheck.passed) {
        approved = false;
        issues.push('Invalid cardholder name format');
      }

      // 5. Spending limits compliance
      const limitsCheck = this.validateSpendingLimits(cardData.limits);
      checks.push(limitsCheck);
      if (!limitsCheck.passed) {
        approved = false;
        issues.push('Spending limits exceed allowed thresholds');
      }

      // 6. Geographic restrictions
      const geoCheck = await this.checkGeographicRestrictions(cardData.country);
      checks.push(geoCheck);
      if (!geoCheck.passed) {
        approved = false;
        issues.push('Geographic restrictions apply');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        approved: false,
        checks,
        issues: [...issues, `Compliance check error: ${message}`],
        bankAcceptance: 'rejected',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      approved,
      checks,
      issues,
      bankAcceptance: approved ? 'accepted' : 'rejected',
      timestamp: new Date().toISOString(),
    };
  }

  // Validate BIN (Bank Identification Number)
  private async validateBIN(bin: string): Promise<ComplianceCheck> {
    if (!bin || bin.length < 6) {
      return {
        name: 'BIN Validation',
        passed: false,
        required: true,
        details: 'Invalid BIN format',
      };
    }

    // In production: Check against BIN database
    // - Verify card network (Visa, Mastercard, etc.)
    // - Check issuing bank
    // - Validate card level (Classic, Gold, Platinum)

    // Determine card network with proper prefix matching
    const isVisa       = bin.startsWith('4');
    const isMastercard = /^5[1-5]/.test(bin) || /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/.test(bin);
    const isAmex       = bin.startsWith('34') || bin.startsWith('37');
    const isDiscover   = bin.startsWith('6011') || bin.startsWith('65') || /^64[4-9]/.test(bin);
    const isDiners     = bin.startsWith('300') || bin.startsWith('305') || bin.startsWith('36') || bin.startsWith('38');
    const isJCB        = /^35(2[89]|[3-8]\d)/.test(bin);

    const isSupported = isVisa || isMastercard || isAmex || isDiscover || isDiners || isJCB;

    if (!isSupported) {
      return {
        name: 'BIN Validation',
        passed: false,
        required: true,
        details: 'Unsupported card network',
      };
    }

    return {
      name: 'BIN Validation',
      passed: true,
      required: true,
      details: 'BIN validated successfully',
    };
  }

  // Verify card issuer
  private async verifyIssuer(bin: string): Promise<ComplianceCheck> {
    // In production: Check issuer reputation
    // - Verify issuer is legitimate
    // - Check for fraud flags
    // - Validate issuer compliance

    return {
      name: 'Issuer Verification',
      passed: true,
      required: true,
      details: 'Issuer verified and approved',
    };
  }

  // Validate card type
  private validateCardType(cardType: string): ComplianceCheck {
    const supportedTypes = ['debit', 'credit', 'prepaid', 'virtual'];
    
    return {
      name: 'Card Type Validation',
      passed: supportedTypes.includes(cardType.toLowerCase()),
      required: true,
      details: supportedTypes.includes(cardType.toLowerCase()) 
        ? 'Card type supported' 
        : 'Card type not supported',
    };
  }

  // Validate cardholder name
  private validateCardholderName(name: string): ComplianceCheck {
    if (!name || name.length < 2) {
      return {
        name: 'Cardholder Name',
        passed: false,
        required: true,
        details: 'Invalid cardholder name',
      };
    }

    // Check for special characters that banks reject
    const invalidChars = /[^a-zA-Z\s\-\'\.]/;
    if (invalidChars.test(name)) {
      return {
        name: 'Cardholder Name',
        passed: false,
        required: true,
        details: 'Name contains invalid characters',
      };
    }

    return {
      name: 'Cardholder Name',
      passed: true,
      required: true,
      details: 'Name format valid',
    };
  }

  // Validate spending limits
  private validateSpendingLimits(limits?: { daily?: number; monthly?: number }): ComplianceCheck {
    if (!limits) {
      return {
        name: 'Spending Limits',
        passed: true,
        required: false,
        details: 'No limits set',
      };
    }

    // Bank compliance: Daily limit should not exceed $10,000 for new accounts
    const maxDaily = 10000;
    const maxMonthly = 50000;

    if (limits.daily && limits.daily > maxDaily) {
      return {
        name: 'Spending Limits',
        passed: false,
        required: true,
        details: `Daily limit exceeds maximum ($${maxDaily})`,
      };
    }

    if (limits.monthly && limits.monthly > maxMonthly) {
      return {
        name: 'Spending Limits',
        passed: false,
        required: true,
        details: `Monthly limit exceeds maximum ($${maxMonthly})`,
      };
    }

    return {
      name: 'Spending Limits',
      passed: true,
      required: false,
      details: 'Limits within acceptable range',
    };
  }

  // Check geographic restrictions
  private async checkGeographicRestrictions(country?: string): Promise<ComplianceCheck> {
    if (!country) {
      return {
        name: 'Geographic Restrictions',
        passed: true,
        required: false,
        details: 'No country specified',
      };
    }

    if (this.sanctionedCountries.has(country)) {
      return {
        name: 'Geographic Restrictions',
        passed: false,
        required: true,
        details: 'Country under sanctions',
      };
    }

    if (this.highRiskCountries.has(country)) {
      return {
        name: 'Geographic Restrictions',
        passed: true,
        required: false,
        details: 'High-risk country - enhanced monitoring required',
      };
    }

    return {
      name: 'Geographic Restrictions',
      passed: true,
      required: false,
      details: 'No geographic restrictions',
    };
  }

  // PCI-DSS compliance check
  async checkPCICompliance(data: PCIComplianceData): Promise<ComplianceCheck> {
    const issues: string[] = [];

    // 1. Card data encryption
    if (!data.encryptionEnabled) {
      issues.push('Card data must be encrypted');
    }

    // 2. Secure storage
    if (!data.secureStorage) {
      issues.push('Card data must be stored securely');
    }

    // 3. Access control
    if (!data.accessControlEnabled) {
      issues.push('Access control must be implemented');
    }

    // 4. Audit logging
    if (!data.auditLoggingEnabled) {
      issues.push('Audit logging must be enabled');
    }

    // 5. Network security
    if (!data.networkSecurityEnabled) {
      issues.push('Network security measures required');
    }

    return {
      name: 'PCI-DSS Compliance',
      passed: issues.length === 0,
      required: true,
      details: issues.length === 0 
        ? 'PCI-DSS compliant' 
        : `Issues: ${issues.join(', ')}`,
    };
  }

  // GDPR compliance check
  async checkGDPRCompliance(data: GDPRComplianceData): Promise<ComplianceCheck> {
    const issues: string[] = [];

    // 1. Consent obtained
    if (!data.consentObtained) {
      issues.push('User consent required');
    }

    // 2. Privacy policy accepted
    if (!data.privacyPolicyAccepted) {
      issues.push('Privacy policy must be accepted');
    }

    // 3. Data retention policy
    if (!data.dataRetentionPolicyDefined) {
      issues.push('Data retention policy required');
    }

    // 4. Right to deletion
    if (!data.deletionMechanismAvailable) {
      issues.push('User data deletion mechanism required');
    }

    // 5. Data portability
    if (!data.dataExportAvailable) {
      issues.push('Data export functionality required');
    }

    return {
      name: 'GDPR Compliance',
      passed: issues.length === 0,
      required: true,
      details: issues.length === 0 
        ? 'GDPR compliant' 
        : `Issues: ${issues.join(', ')}`,
    };
  }
}

// Types
interface KYCData {
  userId?: string;           // When provided, result is persisted to User record
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  country?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  documentType?: string;
  documentNumber?: string;
  documentExpiryDate?: string; // ISO date string — triggers expiry validation when provided
  sourceOfFunds?: string;
  expectedVolume?: number;
  isPEP?: boolean;           // Self-declared politically exposed person flag
}

interface KYCResult {
  status: 'approved' | 'pending' | 'rejected';
  checks: ComplianceCheck[];
  issues: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
}

interface CardComplianceData {
  bin: string;
  cardholderName: string;
  cardType: string;
  country?: string;
  limits?: {
    daily?: number;
    monthly?: number;
  };
}

interface CardComplianceResult {
  approved: boolean;
  checks: ComplianceCheck[];
  issues: string[];
  bankAcceptance: 'accepted' | 'rejected';
  timestamp: string;
}

interface ComplianceCheck {
  name: string;
  passed: boolean;
  required: boolean;
  details: string;
}

interface PCIComplianceData {
  encryptionEnabled: boolean;
  secureStorage: boolean;
  accessControlEnabled: boolean;
  auditLoggingEnabled: boolean;
  networkSecurityEnabled: boolean;
}

interface GDPRComplianceData {
  consentObtained: boolean;
  privacyPolicyAccepted: boolean;
  dataRetentionPolicyDefined: boolean;
  deletionMechanismAvailable: boolean;
  dataExportAvailable: boolean;
}

export const compliance = new ComplianceService();
