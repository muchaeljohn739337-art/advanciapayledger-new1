// Mock prisma before importing the service
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

import { ComplianceService } from '../services/compliance';
import prisma from '../lib/prisma';

const prismaMock = prisma as jest.Mocked<typeof prisma>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validKYC = () => ({
  userId: 'user_test_123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  country: 'US',
  address: '123 Main St',
  city: 'New York',
  postalCode: '10001',
  documentType: 'passport' as const,
  documentNumber: 'P123456789',
  documentExpiryDate: '2030-01-01',
  sourceOfFunds: 'employment',
  expectedVolume: 5000,
});

const validCard = () => ({
  bin: '411111',
  cardholderName: 'John Doe',
  cardType: 'debit' as const,
  country: 'US',
});

let service: ComplianceService;

beforeEach(() => {
  service = new ComplianceService();
  jest.clearAllMocks();
});

// ===========================================================================
// performKYCCheck
// ===========================================================================

describe('performKYCCheck', () => {
  describe('full approval', () => {
    it('approves a fully valid KYC submission', async () => {
      const result = await service.performKYCCheck(validKYC());
      expect(result.status).toBe('approved');
      expect(result.issues).toHaveLength(0);
      expect(result.riskLevel).toBe('low');
    });

    it('returns a valid ISO timestamp', async () => {
      const result = await service.performKYCCheck(validKYC());
      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it('persists kycStatus to APPROVED on success', async () => {
      await service.performKYCCheck(validKYC());
      expect((prismaMock.user.update as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user_test_123' },
          data: expect.objectContaining({ kycStatus: 'APPROVED' }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Sanctions
  // -------------------------------------------------------------------------
  describe('sanctions screening', () => {
    it('rejects a user from a sanctioned country', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), country: 'IR' });
      expect(result.status).toBe('rejected');
      expect(result.issues).toContain('Geographic restrictions apply');
      expect(result.riskLevel).toBe('high');
    });

    it('rejects a user from North Korea (KP)', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), country: 'KP' });
      expect(result.status).toBe('rejected');
    });

    it('rejects if first+last name matches internal watchlist', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        country: 'US',
        firstName: 'Bashar',
        lastName: 'Al-Assad',
      });
      expect(result.status).toBe('rejected');
      expect(result.issues).toContain('Sanctioned country or individual');
    });
  });

  // -------------------------------------------------------------------------
  // Status escalation — rejected must never be overwritten by pending
  // -------------------------------------------------------------------------
  describe('status escalation', () => {
    it('keeps rejected when later checks would only set pending', async () => {
      // Sanctioned country (→ rejected) + missing address fields (→ would set pending)
      const result = await service.performKYCCheck({
        ...validKYC(),
        country: 'SY',
        address: undefined,
        city: undefined,
        postalCode: undefined,
      });
      expect(result.status).toBe('rejected');
    });

    it('escalates approved → pending when address fields are missing', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        address: undefined,
        city: undefined,
        postalCode: undefined,
      });
      expect(result.status).toBe('pending');
      expect(result.issues).toContain('Address verification required');
    });

    it('escalates approved → rejected when age < 18', async () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 16);
      const result = await service.performKYCCheck({
        ...validKYC(),
        dateOfBirth: dob.toISOString().split('T')[0],
      });
      expect(result.status).toBe('rejected');
      expect(result.issues).toContain('Must be 18 years or older');
    });
  });

  // -------------------------------------------------------------------------
  // PEP
  // -------------------------------------------------------------------------
  describe('PEP screening', () => {
    it('sets pending and adds issue when isPEP is true', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), isPEP: true });
      expect(result.status).toBe('pending');
      expect(result.issues).toContain('Enhanced due diligence required (PEP)');
    });

    it('passes when isPEP is false', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), isPEP: false });
      expect(result.status).toBe('approved');
    });
  });

  // -------------------------------------------------------------------------
  // Document verification
  // -------------------------------------------------------------------------
  describe('document verification', () => {
    it('sets pending when documentType is missing', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        documentType: undefined,
      });
      expect(result.status).toBe('pending');
      expect(result.issues).toContain('Document verification required');
    });

    it('sets pending when documentNumber is missing', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        documentNumber: undefined,
      });
      expect(result.status).toBe('pending');
    });

    it('sets pending when document is expired', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        documentExpiryDate: '2020-01-01',
      });
      expect(result.status).toBe('pending');
      expect(result.issues).toContain('Document verification required');
    });

    it('sets pending on invalid expiry date format', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        documentExpiryDate: 'not-a-date',
      });
      expect(result.status).toBe('pending');
    });

    it('approves when expiry is in the future', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        documentExpiryDate: '2035-12-31',
      });
      expect(result.status).toBe('approved');
    });
  });

  // -------------------------------------------------------------------------
  // Source of funds
  // -------------------------------------------------------------------------
  describe('source of funds', () => {
    it('sets pending when sourceOfFunds is missing and expectedVolume > 10000', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        sourceOfFunds: undefined,
        expectedVolume: 50000,
      });
      expect(result.status).toBe('pending');
      expect(result.issues).toContain('Source of funds verification required');
    });

    it('sets pending when sourceOfFunds is missing and expectedVolume is undefined', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        sourceOfFunds: undefined,
        expectedVolume: undefined,
      });
      expect(result.status).toBe('pending');
    });

    it('does NOT set pending when sourceOfFunds is missing but volume <= 10000', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        sourceOfFunds: undefined,
        expectedVolume: 1000,
      });
      // Status depends on other checks — but source-of-funds should not add an issue
      expect(result.issues).not.toContain('Source of funds verification required');
    });
  });

  // -------------------------------------------------------------------------
  // Geographic — high-risk (not sanctioned) passes with enhanced monitoring
  // -------------------------------------------------------------------------
  describe('geographic restrictions', () => {
    it('approves (with note) for a high-risk but not sanctioned country', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), country: 'AF' });
      // AF is high-risk but not sanctioned — geo check passes
      const geoCheck = result.checks.find(c => c.name === 'Geographic Restrictions');
      expect(geoCheck?.passed).toBe(true);
      expect(geoCheck?.details).toMatch(/high-risk/i);
    });
  });

  // -------------------------------------------------------------------------
  // Persistence
  // -------------------------------------------------------------------------
  describe('persistence', () => {
    it('does not call prisma when no userId is provided', async () => {
      const data = validKYC();
      delete (data as any).userId;
      await service.performKYCCheck(data);
      expect((prismaMock.user.update as jest.Mock)).not.toHaveBeenCalled();
    });

    it('persists REJECTED status to db', async () => {
      await service.performKYCCheck({ ...validKYC(), country: 'CU' });
      expect((prismaMock.user.update as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ kycStatus: 'REJECTED' }),
        })
      );
    });

    it('persists UNDER_REVIEW status to db for pending', async () => {
      await service.performKYCCheck({
        ...validKYC(),
        address: undefined,
        city: undefined,
        postalCode: undefined,
      });
      expect((prismaMock.user.update as jest.Mock)).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ kycStatus: 'UNDER_REVIEW' }),
        })
      );
    });

    it('does not throw when prisma rejects (non-fatal)', async () => {
      (prismaMock.user.update as jest.Mock).mockRejectedValueOnce(new Error('DB down'));
      await expect(service.performKYCCheck(validKYC())).resolves.not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Risk level
  // -------------------------------------------------------------------------
  describe('calculateRiskLevel', () => {
    it('returns high when sanctions fail', async () => {
      const result = await service.performKYCCheck({ ...validKYC(), country: 'KP' });
      expect(result.riskLevel).toBe('high');
    });

    it('returns high when required checks fail', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        dateOfBirth: undefined,
        address: undefined,
      });
      expect(result.riskLevel).toBe('high');
    });

    it('returns medium when only optional check fails', async () => {
      const result = await service.performKYCCheck({
        ...validKYC(),
        isPEP: true,
      });
      // PEP is optional — no required checks fail → medium
      expect(result.riskLevel).toBe('medium');
    });

    it('returns low when all checks pass', async () => {
      const result = await service.performKYCCheck(validKYC());
      expect(result.riskLevel).toBe('low');
    });
  });
});

// ===========================================================================
// checkCardCompliance
// ===========================================================================

describe('checkCardCompliance', () => {
  describe('valid cards', () => {
    it('approves a valid Visa debit card', async () => {
      const result = await service.checkCardCompliance(validCard());
      expect(result.approved).toBe(true);
      expect(result.bankAcceptance).toBe('accepted');
      expect(result.issues).toHaveLength(0);
    });

    it('approves a valid Mastercard (5-series)', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '512345' });
      expect(result.approved).toBe(true);
    });

    it('approves a valid Mastercard (2-series)', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '222100' });
      expect(result.approved).toBe(true);
    });

    it('approves a valid Amex (34 prefix)', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '341234' });
      expect(result.approved).toBe(true);
    });

    it('approves a valid Amex (37 prefix)', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '371234' });
      expect(result.approved).toBe(true);
    });

    it('approves a valid Discover card', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '601100' });
      expect(result.approved).toBe(true);
    });
  });

  describe('BIN validation', () => {
    it('rejects an invalid BIN shorter than 6 digits', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '123' });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Invalid BIN or unsupported card network');
    });

    it('rejects an unsupported network', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), bin: '900000' });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Invalid BIN or unsupported card network');
    });
  });

  describe('cardholder name', () => {
    it('rejects a name with invalid characters', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), cardholderName: 'John#Doe' });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Invalid cardholder name format');
    });

    it('accepts hyphens and apostrophes in names', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), cardholderName: "Mary O'Brien-Smith" });
      expect(result.approved).toBe(true);
    });

    it('rejects an empty name', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), cardholderName: '' });
      expect(result.approved).toBe(false);
    });
  });

  describe('card type', () => {
    it('rejects an unsupported card type', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), cardType: 'gift' as any });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Card type not supported');
    });

    it('accepts all supported card types', async () => {
      const types = ['debit', 'credit', 'prepaid', 'virtual'] as const;
      for (const cardType of types) {
        const result = await service.checkCardCompliance({ ...validCard(), cardType });
        expect(result.approved).toBe(true);
      }
    });
  });

  describe('spending limits', () => {
    it('rejects daily limit above $10,000', async () => {
      const result = await service.checkCardCompliance({
        ...validCard(),
        limits: { daily: 15000 },
      });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Spending limits exceed allowed thresholds');
    });

    it('rejects monthly limit above $50,000', async () => {
      const result = await service.checkCardCompliance({
        ...validCard(),
        limits: { monthly: 100000 },
      });
      expect(result.approved).toBe(false);
      expect(result.issues).toContain('Spending limits exceed allowed thresholds');
    });

    it('approves limits within allowed range', async () => {
      const result = await service.checkCardCompliance({
        ...validCard(),
        limits: { daily: 500, monthly: 5000 },
      });
      expect(result.approved).toBe(true);
    });

    it('approves when no limits are specified', async () => {
      const result = await service.checkCardCompliance({ ...validCard() });
      expect(result.approved).toBe(true);
    });
  });

  describe('geographic restrictions', () => {
    it('rejects a card from a sanctioned country', async () => {
      const result = await service.checkCardCompliance({ ...validCard(), country: 'IR' });
      expect(result.approved).toBe(false);
      expect(result.bankAcceptance).toBe('rejected');
      expect(result.issues).toContain('Geographic restrictions apply');
    });

    it('approves when no country is specified', async () => {
      const { country, ...noCountry } = validCard();
      const result = await service.checkCardCompliance(noCountry);
      expect(result.approved).toBe(true);
    });
  });
});

// ===========================================================================
// checkPCICompliance
// ===========================================================================

describe('checkPCICompliance', () => {
  const fullPCI = () => ({
    encryptionEnabled: true,
    secureStorage: true,
    accessControlEnabled: true,
    auditLoggingEnabled: true,
    networkSecurityEnabled: true,
  });

  it('passes when all controls are enabled', async () => {
    const result = await service.checkPCICompliance(fullPCI());
    expect(result.passed).toBe(true);
    expect(result.details).toBe('PCI-DSS compliant');
  });

  it('fails when encryption is disabled', async () => {
    const result = await service.checkPCICompliance({ ...fullPCI(), encryptionEnabled: false });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('Card data must be encrypted');
  });

  it('fails when multiple controls are disabled', async () => {
    const result = await service.checkPCICompliance({
      ...fullPCI(),
      encryptionEnabled: false,
      auditLoggingEnabled: false,
    });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('Card data must be encrypted');
    expect(result.details).toContain('Audit logging must be enabled');
  });
});

// ===========================================================================
// checkGDPRCompliance
// ===========================================================================

describe('checkGDPRCompliance', () => {
  const fullGDPR = () => ({
    consentObtained: true,
    privacyPolicyAccepted: true,
    dataRetentionPolicyDefined: true,
    deletionMechanismAvailable: true,
    dataExportAvailable: true,
  });

  it('passes when all GDPR requirements are met', async () => {
    const result = await service.checkGDPRCompliance(fullGDPR());
    expect(result.passed).toBe(true);
    expect(result.details).toBe('GDPR compliant');
  });

  it('fails when consent is not obtained', async () => {
    const result = await service.checkGDPRCompliance({ ...fullGDPR(), consentObtained: false });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('User consent required');
  });

  it('fails when deletion mechanism is unavailable', async () => {
    const result = await service.checkGDPRCompliance({
      ...fullGDPR(),
      deletionMechanismAvailable: false,
    });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('User data deletion mechanism required');
  });

  it('includes all missing requirements in details', async () => {
    const result = await service.checkGDPRCompliance({
      consentObtained: false,
      privacyPolicyAccepted: false,
      dataRetentionPolicyDefined: false,
      deletionMechanismAvailable: false,
      dataExportAvailable: false,
    });
    expect(result.passed).toBe(false);
    expect(result.details).toContain('User consent required');
    expect(result.details).toContain('Privacy policy must be accepted');
    expect(result.details).toContain('Data retention policy required');
    expect(result.details).toContain('User data deletion mechanism required');
    expect(result.details).toContain('Data export functionality required');
  });
});
