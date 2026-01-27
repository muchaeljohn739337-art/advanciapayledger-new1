// Rockefeller HELOC Whole Life Insurance API Routes
// Implements comprehensive whole life insurance with cancel money philosophy
// Reference Number: 123456789-HELOC

import express from 'express';
import WholeLifeInsuranceService from '../services/WholeLifeInsuranceService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const wholeLifeService = WholeLifeInsuranceService;

// POST /api/whole-life/create - Create whole life insurance policy
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const {
      coverageAmount,
      premium,
      term,
      beneficiaries,
      riders
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!coverageAmount || !premium || !term || !beneficiaries) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: coverageAmount, premium, term, beneficiaries'
      });
    }

    // Validate beneficiaries
    const totalPercentage = beneficiaries.reduce((sum: number, b: any) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Beneficiary percentages must total 100%'
      });
    }

    const result = await wholeLifeService.createWholeLifePolicy({
      userId,
      coverageAmount,
      premium,
      term,
      beneficiaries,
      riders
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          policy: result.policy,
          philosophy: 'Policy created with cancelation profitability built in'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Policy creation failed: ${error.message}`
    });
  }
});

// GET /api/whole-life/policies - Get all policies for user
router.get('/policies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPolicies = await wholeLifeService.getAllPolicies();
    const userPolicies = allPolicies.filter(policy => policy.userId === userId);

    res.json({
      success: true,
      message: `Found ${userPolicies.length} policies`,
      data: {
        policies: userPolicies,
        philosophy: 'Each policy designed for cancelation profitability'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve policies: ${error.message}`
    });
  }
});

// GET /api/whole-life/policy/:policyId - Get specific policy details
router.get('/policy/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    const policy = await wholeLifeService.getPolicyDetails(policyId);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Verify ownership
    if (policy.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Policy details retrieved',
      data: {
        policy,
        cancelationOpportunities: await wholeLifeService.getCancelationOpportunities(policyId)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve policy: ${error.message}`
    });
  }
});

// POST /api/whole-life/cancel-premium - Cancel premium for profit
router.post('/cancel-premium', authenticateToken, async (req, res) => {
  try {
    const { policyId, reason } = req.body;
    const canceledBy = req.user.id;

    const result = await wholeLifeService.cancelPremium(policyId, reason, canceledBy);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          profit: result.profit,
          riskReduction: result.riskReduction,
          philosophy: 'Money made by canceling premium'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Premium cancelation failed: ${error.message}`
    });
  }
});

// POST /api/whole-life/cancel-policy - Cancel entire policy for maximum profit
router.post('/cancel-policy', authenticateToken, async (req, res) => {
  try {
    const { policyId, reason } = req.body;
    const canceledBy = req.user.id;

    const result = await wholeLifeService.cancelPolicy(policyId, reason, canceledBy);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          surrenderValue: result.surrenderValue,
          cancelationProfit: result.cancelationProfit,
          totalRiskReduction: result.totalRiskReduction,
          philosophy: 'Maximum profit achieved through policy cancelation'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Policy cancelation failed: ${error.message}`
    });
  }
});

// GET /api/whole-life/cash-value/:policyId - Get cash value and cancelation opportunities
router.get('/cash-value/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const cashValueInfo = await wholeLifeService.manageCashValue(policyId);

    res.json({
      success: true,
      message: 'Cash value information retrieved',
      data: cashValueInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve cash value: ${error.message}`
    });
  }
});

// POST /api/whole-life/policy-loan - Request policy loan with cancelation profit
router.post('/policy-loan', authenticateToken, async (req, res) => {
  try {
    const { policyId, loanAmount } = req.body;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const result = await wholeLifeService.managePolicyLoan(policyId, loanAmount);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          loanApproved: result.loanApproved,
          cancelationProfit: result.cancelationProfit,
          philosophy: 'Policy loan with built-in cancelation profit'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Policy loan request failed: ${error.message}`
    });
  }
});

// GET /api/whole-life/dividends/:policyId - Get dividend options with cancelation focus
router.get('/dividends/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const dividendInfo = await wholeLifeService.manageDividends(policyId);

    res.json({
      success: true,
      message: 'Dividend options retrieved',
      data: dividendInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve dividends: ${error.message}`
    });
  }
});

// PUT /api/whole-life/beneficiaries/:policyId - Update beneficiaries with cancelation protection
router.put('/beneficiaries/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const { beneficiaries } = req.body;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const result = await wholeLifeService.updateBeneficiaries(policyId, beneficiaries);

    if (result.success) {
      res.json({
        success: true,
        message: 'Beneficiaries updated successfully',
        data: {
          cancelationRisk: result.cancelationRisk,
          protectionStrategies: result.protectionStrategies,
          philosophy: 'Beneficiary protection with cancelation risk management'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to update beneficiaries'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Beneficiary update failed: ${error.message}`
    });
  }
});

// GET /api/whole-life/profitability/:policyId - Get policy profitability metrics
router.get('/profitability/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const profitability = await wholeLifeService.getPolicyProfitability(policyId);

    res.json({
      success: true,
      message: 'Profitability metrics retrieved',
      data: {
        profitability,
        philosophy: 'Profitability driven by cancelation strategies'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve profitability: ${error.message}`
    });
  }
});

// GET /api/whole-life/cancelation-opportunities/:policyId - Get all cancelation opportunities
router.get('/cancelation-opportunities/:policyId', authenticateToken, async (req, res) => {
  try {
    const { policyId } = req.params;
    const userId = req.user.id;

    // Verify policy ownership
    const policy = await wholeLifeService.getPolicyDetails(policyId);
    if (!policy || policy.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found or access denied'
      });
    }

    const opportunities = await wholeLifeService.getCancelationOpportunities(policyId);

    res.json({
      success: true,
      message: `Found ${opportunities.length} cancelation opportunities`,
      data: {
        opportunities,
        totalPotentialProfit: opportunities.reduce((sum, opp) => sum + opp.potentialProfit, 0),
        totalRiskReduction: opportunities.reduce((sum, opp) => sum + opp.riskReduction, 0),
        philosophy: 'Multiple paths to profit through cancelation'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve cancelation opportunities: ${error.message}`
    });
  }
});

// GET /api/whole-life/philosophy - Get whole life insurance philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Whole Life Insurance with Cancel Money Philosophy",
      corePrinciple: "We make money by canceling insurance policies",
      description: "Traditional whole life insurance enhanced with the cancel money philosophy for maximum profitability.",
      keyFeatures: [
        "Guaranteed death benefit",
        "Growing cash value",
        "Policy loans",
        "Dividend payments",
        "Premium cancelation for profit",
        "Policy cancelation for maximum profit",
        "Rider cancelation opportunities",
        "Risk reduction through strategic cancelation"
      ],
      cancelationBenefits: [
        "Premium cancelation: 30% profit",
        "Policy cancelation: 40% profit",
        "Rider cancelation: 50% profit",
        "Risk reduction: 80-95% through cancelation",
        "Profit optimization: Multiple cancelation paths"
      ],
      mathematicalAdvantage: {
        traditional: "Premiums + Interest - Claims = Minimal Profit",
        cancelation: "Cancelation Profit + Risk Reduction = Maximum Profit"
      },
      integration: {
        heLOC: "Integrated with HELOC for comprehensive financial protection",
        layeredNetwork: "Operates within secure layered network architecture",
        advancedPrinciples: "Implements compartmentalization and controlled trust"
      }
    };

    res.json({
      success: true,
      message: "Whole life insurance philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve philosophy: ${error.message}`
    });
  }
});

// GET /api/whole-life/health - Check whole life insurance service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = {
      status: "Healthy",
      service: "Whole Life Insurance Service",
      philosophy: "Cancel Money to Make Money",
      uptime: process.uptime(),
      policies: (await wholeLifeService.getAllPolicies()).length,
      metrics: {
        totalPolicies: 0,
        totalCoverage: 0,
        totalCashValue: 0,
        cancelationProfit: 0,
        riskReduction: 0
      },
      message: "Service actively creating and canceling policies for profit"
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Health check failed: ${error.message}`
    });
  }
});

export default router;
