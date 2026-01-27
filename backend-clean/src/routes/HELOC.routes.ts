// HELOC Routes for Rockefeller Home Protection Plan Integration
// Reference Number: 123456789-HELOC

import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { HELOCService } from '../services/HELOCService';
import { 
  DrawPurpose, 
  RepaymentType, 
  PaymentMethod,
  HELOCStatus,
  DrawStatus,
  HELOCCalculator
} from '../models/HELOC';

const router = Router();

// Middleware to ensure user has protection plan
const requireProtectionPlan = async (req: AuthRequest, res: Response, next: any) => {
  try {
    // In production, verify user has active protection plan
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Mock verification - in production, check database
    const hasProtectionPlan = true;
    if (!hasProtectionPlan) {
      return res.status(403).json({ 
        error: 'Rockefeller Home Protection Plan required for HELOC access' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Apply authentication and protection plan middleware
router.use(authenticate);
router.use(requireProtectionPlan);

// ============================================================================
// APPLICATION ENDPOINTS
// ============================================================================

// Submit HELOC application
router.post('/application', async (req: AuthRequest, res: Response) => {
  try {
    const { homeValue, requestedAmount } = req.body;
    
    if (!homeValue || !requestedAmount) {
      return res.status(400).json({ 
        error: 'Home value and requested amount are required' 
      });
    }

    const application = await HELOCService.createApplication(
      req.user!.id,
      homeValue,
      requestedAmount
    );

    res.status(201).json({
      success: true,
      application,
      message: 'HELOC application submitted successfully'
    });
  } catch (error) {
    console.error('HELOC Application Error:', error);
    res.status(500).json({ error: 'Application submission failed' });
  }
});

// Get application status
router.get('/application/:applicationId', async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    
    // In production, verify user owns this application
    const application = await HELOCService.getApplication(applicationId);
    
    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get Application Error:', error);
    res.status(500).json({ error: 'Failed to retrieve application' });
  }
});

// Get risk assessment
router.get('/application/:applicationId/risk-assessment', async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    
    const riskAssessment = await HELOCService.assessRisk(applicationId);
    
    res.json({
      success: true,
      riskAssessment
    });
  } catch (error) {
    console.error('Risk Assessment Error:', error);
    res.status(500).json({ error: 'Risk assessment failed' });
  }
});

// ============================================================================
// ACCOUNT MANAGEMENT ENDPOINTS
// ============================================================================

// Activate HELOC account
router.post('/account/activate/:applicationId', async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.params;
    
    // Approve application first
    await HELOCService.approveApplication(applicationId);
    
    // Activate account
    const account = await HELOCService.activateAccount(applicationId);
    
    // Enable trust protection
    await HELOCService.enableTrustProtection(account.id);
    
    res.status(201).json({
      success: true,
      account,
      message: 'HELOC account activated successfully'
    });
  } catch (error) {
    console.error('Account Activation Error:', error);
    res.status(500).json({ error: 'Account activation failed' });
  }
});

// Get account details
router.get('/account/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    const accountSummary = await HELOCService.getAccountSummary(accountId);
    
    res.json({
      success: true,
      accountSummary
    });
  } catch (error) {
    console.error('Get Account Error:', error);
    res.status(500).json({ error: 'Failed to retrieve account details' });
  }
});

// ============================================================================
// DRAW MANAGEMENT ENDPOINTS
// ============================================================================

// Request draw
router.post('/draw', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, amount, purpose, description } = req.body;
    
    if (!accountId || !amount || !purpose) {
      return res.status(400).json({ 
        error: 'Account ID, amount, and purpose are required' 
      });
    }

    const draw = await HELOCService.requestDraw(
      accountId,
      amount,
      purpose as DrawPurpose,
      description || ''
    );

    res.status(201).json({
      success: true,
      draw,
      message: draw.status === DrawStatus.APPROVED 
        ? 'Draw approved and processed' 
        : 'Draw submitted for review'
    });
  } catch (error) {
    console.error('Draw Request Error:', error);
    res.status(500).json({ error: 'Draw request failed' });
  }
});

// Get draw history
router.get('/draw/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    // In production, fetch from database
    const draws = []; // Mock implementation
    
    res.json({
      success: true,
      draws
    });
  } catch (error) {
    console.error('Get Draws Error:', error);
    res.status(500).json({ error: 'Failed to retrieve draw history' });
  }
});

// ============================================================================
// PAYMENT ENDPOINTS
// ============================================================================

// Process payment
router.post('/payment', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, amount, type, method } = req.body;
    
    if (!accountId || !amount || !type || !method) {
      return res.status(400).json({ 
        error: 'Account ID, amount, type, and method are required' 
      });
    }

    const payment = await HELOCService.processPayment(
      accountId,
      amount,
      type as RepaymentType,
      method as PaymentMethod
    );

    res.status(201).json({
      success: true,
      payment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Payment Processing Error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get payment history
router.get('/payment/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    // In production, fetch from database
    const payments = []; // Mock implementation
    
    res.json({
      success: true,
      payments
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment history' });
  }
});

// ============================================================================
// TRUST PROTECTION ENDPOINTS
// ============================================================================

// Enable trust protection
router.post('/trust-protection/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    await HELOCService.enableTrustProtection(accountId);
    
    res.json({
      success: true,
      message: 'Trust protection enabled successfully'
    });
  } catch (error) {
    console.error('Trust Protection Error:', error);
    res.status(500).json({ error: 'Failed to enable trust protection' });
  }
});

// Process trust payment
router.post('/trust-payment/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    const payment = await HELOCService.processTrustPayment(accountId);
    
    res.json({
      success: true,
      payment,
      message: 'Trust payment processed successfully'
    });
  } catch (error) {
    console.error('Trust Payment Error:', error);
    res.status(500).json({ error: 'Trust payment processing failed' });
  }
});

// ============================================================================
// NOTIFICATIONS ENDPOINTS
// ============================================================================

// Get notifications
router.get('/notifications/:accountId', async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.params;
    
    // In production, fetch from database
    const notifications = []; // Mock implementation
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    // In production, update in database
    console.log(`Notification ${notificationId} marked as read`);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

// Get portfolio metrics (admin only)
router.get('/admin/portfolio-metrics', async (req: AuthRequest, res: Response) => {
  try {
    // In production, verify admin role
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const metrics = await HELOCService.getPortfolioMetrics();
    
    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Portfolio Metrics Error:', error);
    res.status(500).json({ error: 'Failed to retrieve portfolio metrics' });
  }
});

// Get all applications (admin only)
router.get('/admin/applications', async (req: AuthRequest, res: Response) => {
  try {
    // In production, verify admin role
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // In production, fetch from database
    const applications = []; // Mock implementation
    
    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// ============================================================================
// UTILITY ENDPOINTS
// ============================================================================

// Calculate payment estimate
router.post('/calculate-payment', async (req: AuthRequest, res: Response) => {
  try {
    const { principal, annualRate, years } = req.body;
    
    if (!principal || !annualRate || !years) {
      return res.status(400).json({ 
        error: 'Principal, annual rate, and years are required' 
      });
    }

    const monthlyPayment = HELOCCalculator.calculateMonthlyPayment(
      principal,
      annualRate,
      years
    );

    res.json({
      success: true,
      monthlyPayment,
      message: 'Payment calculated successfully'
    });
  } catch (error) {
    console.error('Payment Calculation Error:', error);
    res.status(500).json({ error: 'Payment calculation failed' });
  }
});

// Get HELOC settings
router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    // Return public settings
    const settings = {
      defaultInterestRate: 7.5,
      maxLTV: 80,
      preferredMaxLTV: 85,
      setupFee: 0,
      annualFee: 0,
      drawPeriodYears: 15,
      repaymentPeriodYears: 25,
      emergencyDrawLimit: 25000,
      counselingThreshold: 50000
    };

    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get Settings Error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

export default router;
