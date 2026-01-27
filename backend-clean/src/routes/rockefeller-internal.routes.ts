import express from 'express';
import { RockefellerInsuranceController } from '../controllers/rockefeller-insurance.controller';
import { 
  internalAuth, 
  adminOnly, 
  underwritingAccess, 
  claimsAccess, 
  trustAccess, 
  readonlyAccess,
  internalRateLimit,
  internalAuditLog,
  validateServiceRegistration
} from '../middleware/internal-auth.middleware';

const router = express.Router();

// Apply internal authentication and audit logging to all routes
router.use(validateServiceRegistration);
router.use(internalAuditLog);
router.use(internalRateLimit(300, 3600000)); // 300 requests per hour for internal endpoints

// Policy holder dashboard (Readonly access)
router.get('/dashboard/policyholders/:policyHolderId', readonlyAccess, RockefellerInsuranceController.getPolicyHolderDashboard);

// Generate policy illustration (Underwriting access)
router.post('/illustrations', underwritingAccess, RockefellerInsuranceController.generateIllustration);

// Validate policy eligibility (Underwriting access)
router.post('/eligibility', underwritingAccess, RockefellerInsuranceController.validateEligibility);

// Get policy loan information (Readonly access)
router.get('/policies/:policyId/loan-info', readonlyAccess, RockefellerInsuranceController.getPolicyLoanInfo);

// Process policy loan (Admin access required)
router.post('/policies/:policyId/loan', adminOnly, RockefellerInsuranceController.processPolicyLoan);

// Calculate surrender value (Readonly access)
router.get('/policies/:policyId/surrender-value', readonlyAccess, RockefellerInsuranceController.calculateSurrenderValue);

// Get family trusts (Trust access)
router.get('/trusts', trustAccess, RockefellerInsuranceController.getFamilyTrusts);

// Get comprehensive policy report (Readonly access)
router.get('/policies/:policyId/report', readonlyAccess, RockefellerInsuranceController.getPolicyReport);

// Search policies by reference number (Readonly access)
router.get('/search/reference/:referenceNumber', readonlyAccess, RockefellerInsuranceController.searchByReference);

// Internal system health check (Internal access only)
router.get('/health', internalAuth(), (req, res) => {
  const internal = (req as any).internal;
  res.status(200).json({
    success: true,
    message: 'Rockefeller Internal System operational',
    system: {
      status: 'HEALTHY',
      referenceNumber: '123456789',
      service: internal.service,
      accessLevel: internal.accessLevel,
      timestamp: new Date().toISOString()
    }
  });
});

// Internal metrics endpoint (Admin only)
router.get('/metrics', adminOnly, (req, res) => {
  const internal = (req as any).internal;
  res.status(200).json({
    success: true,
    message: 'Internal system metrics',
    metrics: {
      totalPolicies: 0, // Would be populated from database
      activePolicies: 0,
      totalCashValue: 0,
      totalPremiums: 0,
      pendingClaims: 0,
      referenceNumber: '123456789',
      lastUpdated: new Date().toISOString()
    }
  });
});

// Internal audit log endpoint (Admin only)
router.get('/audit', adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Audit log access granted',
    audit: {
      endpoint: '/internal/audit',
      accessLevel: 'ADMIN',
      referenceNumber: '123456789',
      timestamp: new Date().toISOString(),
      note: 'Full audit log would be implemented here'
    }
  });
});

export default router;
