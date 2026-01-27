// Rockefeller HELOC Asset Integration API Routes
// Implements whole life insurance with asset integration and tax optimization
// Reference Number: 123456789-HELOC

import express from 'express';
import AssetIntegrationService from '../services/AssetIntegrationService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const assetIntegrationService = AssetIntegrationService;

// POST /api/asset-integration/integrate - Integrate all assets into insurance policy
router.post('/integrate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { assets, policyDetails } = req.body;

    if (!assets || !policyDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: assets, policyDetails'
      });
    }

    const result = await assetIntegrationService.integrateAssetsIntoPolicy(userId, assets, policyDetails);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          portfolio: result.portfolio,
          policy: result.policy,
          borrowingStrategy: result.borrowingStrategy,
          taxBenefits: result.taxBenefits
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
      message: `Asset integration failed: ${error.message}`
    });
  }
});

// POST /api/asset-integration/borrow - Execute borrowing strategy against integrated assets
router.post('/borrow', authenticateToken, async (req, res) => {
  try {
    const { portfolioId, borrowingAmount, purpose } = req.body;

    if (!portfolioId || !borrowingAmount || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: portfolioId, borrowingAmount, purpose'
      });
    }

    const result = await assetIntegrationService.executeBorrowingStrategy(portfolioId, borrowingAmount, purpose);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          loanAmount: result.loanAmount,
          interestRate: result.interestRate,
          taxDeductible: result.taxDeductible,
          repaymentTerms: result.repaymentTerms,
          riskAssessment: result.riskAssessment
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
      message: `Borrowing strategy failed: ${error.message}`
    });
  }
});

// GET /api/asset-integration/tax-analysis/:portfolioId - Analyze tax optimization
router.get('/tax-analysis/:portfolioId', authenticateToken, async (req, res) => {
  try {
    const { portfolioId } = req.params;

    const analysis = await assetIntegrationService.analyzeTaxOptimization(portfolioId);

    res.json({
      success: true,
      message: 'Tax optimization analysis completed',
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Tax analysis failed: ${error.message}`
    });
  }
});

// GET /api/asset-integration/connection - Check system connection status
router.get('/connection', authenticateToken, async (req, res) => {
  try {
    const status = await assetIntegrationService.checkConnectionStatus();

    res.json({
      success: true,
      message: 'Connection status retrieved',
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Connection check failed: ${error.message}`
    });
  }
});

// GET /api/asset-integration/portfolios - Get all asset portfolios
router.get('/portfolios', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPortfolios = await assetIntegrationService.getAllPortfolios();
    const userPortfolios = allPortfolios.filter(portfolio => portfolio.userId === userId);

    res.json({
      success: true,
      message: `Found ${userPortfolios.length} portfolios`,
      data: {
        portfolios: userPortfolios,
        totalValue: userPortfolios.reduce((sum, p) => sum + p.totalValue, 0),
        totalBorrowingCapacity: userPortfolios.reduce((sum, p) => sum + p.borrowingCapacity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve portfolios: ${error.message}`
    });
  }
});

// GET /api/asset-integration/portfolio/:id - Get specific portfolio
router.get('/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const portfolio = await assetIntegrationService.getPortfolio(id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Verify ownership
    if (portfolio.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const policy = await assetIntegrationService.getPolicy(portfolio.insurancePolicyId);

    res.json({
      success: true,
      message: 'Portfolio retrieved',
      data: {
        portfolio,
        policy,
        taxOptimization: portfolio.taxOptimization
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve portfolio: ${error.message}`
    });
  }
});

// GET /api/asset-integration/policies - Get all insurance policies
router.get('/policies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPolicies = await assetIntegrationService.getAllPolicies();
    
    // Filter policies by user through their portfolios
    const userPortfolios = await assetIntegrationService.getAllPortfolios();
    const userPortfolioIds = userPortfolios
      .filter(p => p.userId === userId)
      .map(p => p.insurancePolicyId);
    
    const userPolicies = allPolicies.filter(policy => 
      userPortfolioIds.includes(policy.id)
    );

    res.json({
      success: true,
      message: `Found ${userPolicies.length} policies`,
      data: {
        policies: userPolicies,
        totalDeathBenefit: userPolicies.reduce((sum, p) => sum + p.deathBenefit, 0),
        totalCashValue: userPolicies.reduce((sum, p) => sum + p.cashValue, 0),
        totalBorrowingPower: userPolicies.reduce((sum, p) => sum + p.borrowingPower, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve policies: ${error.message}`
    });
  }
});

// GET /api/asset-integration/policy/:id - Get specific policy
router.get('/policy/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const policy = await assetIntegrationService.getPolicy(id);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        message: 'Policy not found'
      });
    }

    // Verify ownership through portfolio
    const allPortfolios = await assetIntegrationService.getAllPortfolios();
    const userPortfolio = allPortfolios.find(p => 
      p.insurancePolicyId === id && p.userId === userId
    );

    if (!userPortfolio) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      message: 'Policy retrieved',
      data: {
        policy,
        portfolio: userPortfolio,
        borrowingCapacity: policy.borrowingPower - policy.loanBalance
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve policy: ${error.message}`
    });
  }
});

// PUT /api/asset-integration/policy/:id/cash-value - Update policy cash value
router.put('/policy/:id/cash-value', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { cashValue } = req.body;

    if (cashValue === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: cashValue'
      });
    }

    // Verify ownership
    const allPortfolios = await assetIntegrationService.getAllPortfolios();
    const userPortfolio = allPortfolios.find(p => 
      p.insurancePolicyId === id && p.userId === req.user.id
    );

    if (!userPortfolio) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await assetIntegrationService.updatePolicyCashValue(id, cashValue);

    res.json({
      success: true,
      message: 'Policy cash value updated',
      data: {
        policyId: id,
        newCashValue: cashValue,
        newBorrowingPower: cashValue * 0.9
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to update cash value: ${error.message}`
    });
  }
});

// GET /api/asset-integration/borrowing-strategies - Get all borrowing strategies
router.get('/borrowing-strategies', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allPortfolios = await assetIntegrationService.getAllPortfolios();
    const userPortfolios = allPortfolios.filter(p => p.userId === userId);
    
    const strategies = [];
    for (const portfolio of userPortfolios) {
      const policy = await assetIntegrationService.getPolicy(portfolio.insurancePolicyId);
      if (policy) {
        strategies.push({
          portfolioId: portfolio.id,
          policyId: policy.id,
          totalAssets: portfolio.totalValue,
          policyValue: policy.cashValue,
          borrowingCapacity: policy.borrowingPower - policy.loanBalance,
          interestRate: 0.045, // 4.5% policy loan rate
          taxDeductible: true,
          riskLevel: 'LOW'
        });
      }
    }

    res.json({
      success: true,
      message: `Found ${strategies.length} borrowing strategies`,
      data: {
        strategies,
        totalBorrowingCapacity: strategies.reduce((sum, s) => sum + s.borrowingCapacity, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve borrowing strategies: ${error.message}`
    });
  }
});

// GET /api/asset-integration/philosophy - Get asset integration philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Asset Integration Philosophy",
      corePrinciple: "Tap everything into whole life insurance for tax optimization",
      description: "Integrate all assets, business, and investments into a $20M tax-advantaged whole life policy",
      keyStrategies: [
        "Integrate all assets into insurance policy",
        "Borrow against integrated assets tax-free",
        "Eliminate capital gains and estate taxes",
        "Provide $20M tax-free death benefit",
        "Step-up basis for all assets at death"
      ],
      taxBenefits: [
        "Tax-free cash value growth",
        "Tax-free death benefit ($20M)",
        "Step-up in basis on all assets",
        "No capital gains taxes",
        "Estate tax avoidance",
        "Tax-deductible policy loan interest"
      ],
      borrowingAdvantages: [
        "Borrow up to 90% of cash value",
        "Tax-deductible interest",
        "No mandatory repayment schedule",
        "Flexible access to capital",
        "Asset protection benefits"
      ],
      legacyPlanning: {
        deathBenefit: "$20 million tax-free to family",
        assetProtection: "All assets protected from creditors",
        businessSuccession: "Smooth business transition",
        generationSkipping: "Multi-generational wealth transfer",
        charitableGiving: "Tax-efficient charitable donations"
      }
    };

    res.json({
      success: true,
      message: "Asset integration philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve philosophy: ${error.message}`
    });
  }
});

// GET /api/asset-integration/health - Check asset integration service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const connectionStatus = await assetIntegrationService.checkConnectionStatus();
    const allPortfolios = await assetIntegrationService.getAllPortfolios();
    const allPolicies = await assetIntegrationService.getAllPolicies();

    const health = {
      status: "Integrated",
      service: "Asset Integration Service",
      philosophy: "Tap everything into tax-advantaged insurance",
      uptime: process.uptime(),
      connectionStatus,
      portfolios: allPortfolios.length,
      policies: allPolicies.length,
      totalAssets: allPortfolios.reduce((sum, p) => sum + p.totalValue, 0),
      totalDeathBenefit: allPolicies.reduce((sum, p) => sum + p.deathBenefit, 0),
      totalBorrowingCapacity: allPolicies.reduce((sum, p) => sum + (p.borrowingPower - p.loanBalance), 0),
      message: "Service actively integrating assets and optimizing taxes"
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
