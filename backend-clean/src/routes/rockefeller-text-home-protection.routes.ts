import express from 'express';
import { RockefellerHomeProtectionService } from '../services/rockefeller-home-protection.service';
import { 
  authenticateTextAgent, 
  requireTextAgentCapability, 
  logTextAgentActivity
} from '../middleware/text-agent-auth.middleware';

const router = express.Router();
const homeProtectionService = new RockefellerHomeProtectionService();

// Apply text agent authentication and audit logging to all routes
router.use(authenticateTextAgent);
router.use(logTextAgentActivity);

// Text Agent creates home protection plan (Text Home Protection capability required)
router.post('/text/home-protection-plan', requireTextAgentCapability('home_protection'), async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    const {
      homeValue,
      monthlyPropertyTaxes,
      monthlyInsurance,
      monthlyMaintenance,
      monthlyUtilities,
      familySize,
      protectionGoal,
      budgetConstraint,
      existingMortgage,
      existingInsurance,
      riskTolerance
    } = req.body;

    // Validate required fields
    if (!homeValue || !familySize || !protectionGoal) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: homeValue, familySize, protectionGoal',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Create home protection plan
    const plan = await homeProtectionService.createHomeProtectionPlan({
      homeValue,
      monthlyPropertyTaxes: monthlyPropertyTaxes || 0,
      monthlyInsurance: monthlyInsurance || 0,
      monthlyMaintenance: monthlyMaintenance || 0,
      monthlyUtilities: monthlyUtilities || 0,
      familySize,
      protectionGoal,
      budgetConstraint: budgetConstraint || null,
      existingMortgage: existingMortgage || null,
      existingInsurance: existingInsurance || null,
      riskTolerance: riskTolerance || 'moderate',
      textAgentId: agent.id,
      textAgentCapabilities: agent.capabilities
    });

    // Log sensitive operation
    console.log(`[TEXT_AGENT_SENSITIVE] ${agent.id} created home protection plan for $${homeValue} home`);

    res.json({
      success: true,
      message: 'Home protection plan created successfully',
      data: {
        plan,
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities
        },
        referenceNumber: '123456789',
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create home protection plan',
      code: 'PLAN_CREATION_FAILED'
    });
  }
});

// Text Agent gets policy analysis (Text Analysis capability required)
router.post('/text/policy-analysis', requireTextAgentCapability('policy_analysis'), async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    const { policyData, analysisType } = req.body;

    if (!policyData || !analysisType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: policyData, analysisType',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const analysis = await homeProtectionService.analyzePolicy({
      policyData,
      analysisType,
      textAgentId: agent.id
    });

    res.json({
      success: true,
      message: 'Policy analysis completed',
      data: {
        analysis,
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities
        }
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze policy',
      code: 'POLICY_ANALYSIS_FAILED'
    });
  }
});

// Text Agent creates trust structure (Text Trust Management capability required)
router.post('/text/trust-creation', requireTextAgentCapability('trust_creation'), async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    const {
      trustType,
      assets,
      beneficiaries,
      trustTerms,
      protectionGoals
    } = req.body;

    if (!trustType || !assets || !beneficiaries) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: trustType, assets, beneficiaries',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const trust = await homeProtectionService.createTrust({
      trustType,
      assets,
      beneficiaries,
      trustTerms: trustTerms || {},
      protectionGoals: protectionGoals || [],
      textAgentId: agent.id
    });

    // Log sensitive operation
    console.log(`[TEXT_AGENT_SENSITIVE] ${agent.id} created ${trustType} trust with ${assets.length} assets`);

    res.json({
      success: true,
      message: 'Trust structure created successfully',
      data: {
        trust,
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities
        }
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create trust structure',
      code: 'TRUST_CREATION_FAILED'
    });
  }
});

// Text Agent calculates premiums (Text Calculation capability required)
router.post('/text/premium-calculation', requireTextAgentCapability('premium_calculation'), async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    const {
      coverageAmount,
      policyType,
      term,
      riskFactors,
      discounts
    } = req.body;

    if (!coverageAmount || !policyType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: coverageAmount, policyType',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const calculation = await homeProtectionService.calculatePremium({
      coverageAmount,
      policyType,
      term: term || null,
      riskFactors: riskFactors || [],
      discounts: discounts || [],
      textAgentId: agent.id
    });

    res.json({
      success: true,
      message: 'Premium calculation completed',
      data: {
        calculation,
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities
        }
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate premium',
      code: 'PREMIUM_CALCULATION_FAILED'
    });
  }
});

// Text Agent gets risk assessment (Text Risk Assessment capability required)
router.post('/text/risk-assessment', requireTextAgentCapability('risk_assessment'), async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    const {
      applicantData,
      propertyData,
      coverageRequirements,
      assessmentType
    } = req.body;

    if (!applicantData || !assessmentType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: applicantData, assessmentType',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    const assessment = await homeProtectionService.assessRisk({
      applicantData,
      propertyData: propertyData || {},
      coverageRequirements: coverageRequirements || {},
      assessmentType,
      textAgentId: agent.id
    });

    res.json({
      success: true,
      message: 'Risk assessment completed',
      data: {
        assessment,
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities
        }
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assess risk',
      code: 'RISK_ASSESSMENT_FAILED'
    });
  }
});

// Text Agent status check (no special capability required)
router.get('/text/status', authenticateTextAgent, async (req, res) => {
  try {
    const agent = (req as any).textAgent;
    
    res.json({
      success: true,
      message: 'Text agent status retrieved',
      data: {
        textAgent: {
          id: agent.id,
          capabilities: agent.capabilities,
          network: agent.network,
          authenticated: agent.authenticated
        },
        systemStatus: 'operational',
        referenceNumber: '123456789',
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('[TEXT_AGENT_ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve text agent status',
      code: 'STATUS_RETRIEVAL_FAILED'
    });
  }
});

export default router;
