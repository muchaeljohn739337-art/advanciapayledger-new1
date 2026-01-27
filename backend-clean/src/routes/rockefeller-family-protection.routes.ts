import express from 'express';
import { RockefellerPremiumService } from '../services/rockefeller-premium.service';
import { 
  internalAuth, 
  adminOnly, 
  underwritingAccess, 
  readonlyAccess,
  internalAuditLog,
  validateServiceRegistration
} from '../middleware/internal-auth.middleware';

const router = express.Router();
const premiumService = new RockefellerPremiumService();

// Apply internal authentication and audit logging
router.use(validateServiceRegistration);
router.use(internalAuditLog);

// Generate $20M + $20M Family Protection Plan
router.post('/family-protection-plan', underwritingAccess, async (req, res) => {
  try {
    const {
      age,
      healthRating = 'PREFERRED',
      paymentFrequency = 'MONTHLY',
      policyHolderName,
      familyMembers
    } = req.body;

    const familyPlan = premiumService.calculateFamilyProtectionPremium(
      age,
      healthRating,
      paymentFrequency
    );

    // Create policy structure
    const policyStructure = {
      referenceNumber: '123456789',
      policyType: 'ROCKEFELLER_FAMILY_PROTECTION_40M',
      policyHolder: {
        name: policyHolderName,
        age: age,
        healthRating: healthRating
      },
      coverageStructure: {
        policyHolderBenefit: 20000000,
        familyBenefit: 20000000,
        totalCoverage: 40000000,
        benefitSplit: "50/50"
      },
      premiumStructure: familyPlan.premiumStructure,
      beneficiaries: [
        {
          name: "Policy Holder Estate",
          relationship: "Estate",
          allocationAmount: 20000000,
          percentage: 50,
          protectionType: "immediate"
        },
        {
          name: "Family Protection Trust",
          relationship: "Trust",
          allocationAmount: 20000000,
          percentage: 50,
          protectionType: "trust"
        }
      ],
      familyMembers: familyMembers || [],
      trustProtection: familyPlan.trustProtection,
      rockefellerEnhancements: {
        multiplier: 1.23456789,
        familyProtectionBonus: 1.156789,
        taxProtection: "100% Tax-Free",
        generationalProtection: true
      }
    };

    res.status(200).json({
      success: true,
      data: policyStructure,
      message: 'Rockefeller Family Protection Plan generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating family protection plan',
      error: error.message
    });
  }
});

// Get detailed policy illustration
router.post('/family-protection-illustration', underwritingAccess, async (req, res) => {
  try {
    const {
      age,
      healthRating = 'PREFERRED',
      paymentFrequency = 'MONTHLY'
    } = req.body;

    const illustration = premiumService.generateFamilyProtectionIllustration(age, healthRating);

    res.status(200).json({
      success: true,
      data: illustration,
      message: 'Family protection illustration generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating illustration',
      error: error.message
    });
  }
});

// Calculate policy loan options for $40M plan
router.post('/family-protection-loan', readonlyAccess, async (req, res) => {
  try {
    const { cashValue } = req.body;

    const loanOptions = premiumService.calculatePolicyLoanOptions(cashValue);

    res.status(200).json({
      success: true,
      data: loanOptions,
      message: 'Policy loan options calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating loan options',
      error: error.message
    });
  }
});

// Calculate surrender value for $40M plan
router.post('/family-protection-surrender', readonlyAccess, async (req, res) => {
  try {
    const {
      cashValue,
      yearsInForce,
      totalPremiumsPaid
    } = req.body;

    const surrenderValue = premiumService.calculateSurrenderValue(
      cashValue,
      yearsInForce,
      totalPremiumsPaid
    );

    res.status(200).json({
      success: true,
      data: surrenderValue,
      message: 'Surrender value calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating surrender value',
      error: error.message
    });
  }
});

// Create family trust structure
router.post('/family-trust-structure', trustAccess, async (req, res) => {
  try {
    const {
      trustName,
      trusteeName,
      beneficiaries,
      protectionAmount = 40000000,
      distributionOptions
    } = req.body;

    const trustStructure = {
      referenceNumber: '123456789',
      trustName: trustName || 'Rockefeller Family Protection Trust',
      trusteeName: trusteeName || 'Rockefeller Trust Services',
      protectionAmount: protectionAmount,
      beneficiaries: beneficiaries || [
        {
          name: 'Primary Beneficiary',
          allocation: 20000000,
          percentage: 50,
          distributionType: 'immediate'
        },
        {
          name: 'Family Trust',
          allocation: 20000000,
          percentage: 50,
          distributionType: 'trust_installment'
        }
      ],
      distributionOptions: distributionOptions || {
        immediate: 20000000,
        installment: {
          amount: 20000000,
          schedule: 'monthly',
          duration: '20_years',
          interestRate: 0.05
        }
      },
      taxProtection: {
        estateTaxProtection: true,
        generationSkippingTax: true,
        incomeTaxProtection: true,
        giftTaxProtection: true
      },
      rockefellerFeatures: {
        multiGenerationalProtection: true,
        assetProtection: true,
        creditorProtection: true,
        divorceProtection: true
      }
    };

    res.status(200).json({
      success: true,
      data: trustStructure,
      message: 'Family trust structure created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating trust structure',
      error: error.message
    });
  }
});

// Get premium comparison for different coverage levels
router.get('/premium-comparison', readonlyAccess, async (req, res) => {
  try {
    const { age = 45, healthRating = 'PREFERRED' } = req.query;

    const coverageLevels = [
      { name: 'Standard', coverage: 10000000 },
      { name: 'Enhanced', coverage: 20000000 },
      { name: 'Family Protection', coverage: 40000000 },
      { name: 'Legacy', coverage: 50000000 }
    ];

    const comparisons = coverageLevels.map(level => {
      const premium = premiumService.calculateFamilyProtectionPremium(
        Number(age),
        healthRating as string
      );
      
      return {
        coverageLevel: level.name,
        coverageAmount: level.coverage,
        monthlyPremium: (premium.premiumStructure.monthlyPremium * (level.coverage / 40000000)).toFixed(2),
        annualPremium: (premium.premiumStructure.annualPremium * (level.coverage / 40000000)).toFixed(2),
        deathBenefit: (level.coverage * 1.23456789).toFixed(2),
        cashValueProjection: premium.premiumStructure.cashValueProjection.map(cv => 
          Math.round(cv * (level.coverage / 40000000))
        )
      };
    });

    res.status(200).json({
      success: true,
      data: comparisons,
      message: 'Premium comparison generated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating premium comparison',
      error: error.message
    });
  }
});

// Create beneficiary allocation for $20M + $20M structure
router.post('/beneficiary-allocation', underwritingAccess, async (req, res) => {
  try {
    const {
      primaryBeneficiaries,
      trustBeneficiaries,
      allocationPreference = 'equal'
    } = req.body;

    const allocationStructure = {
      referenceNumber: '123456789',
      totalDeathBenefit: 40000000,
      allocationStructure: {
        policyHolderPortion: {
          amount: 20000000,
          percentage: 50,
          beneficiaries: primaryBeneficiaries || [
            {
              name: 'Policy Holder Estate',
              relationship: 'Estate',
              allocationPercentage: 100
            }
          ]
        },
        familyPortion: {
          amount: 20000000,
          percentage: 50,
          beneficiaries: trustBeneficiaries || [
            {
              name: 'Family Protection Trust',
              relationship: 'Trust',
              allocationPercentage: 100
            }
          ]
        }
      },
      distributionOptions: {
        immediate: {
          amount: 20000000,
          available: true,
          taxFree: true
        },
        trust: {
          amount: 20000000,
          trustType: 'Revocable Living Trust',
          distributionSchedule: 'Flexible',
          taxProtection: true
        }
      },
      rockefellerProtections: {
        creditorProtection: true,
        divorceProtection: true,
        estateTaxProtection: true,
        generationSkippingProtection: true
      }
    };

    res.status(200).json({
      success: true,
      data: allocationStructure,
      message: 'Beneficiary allocation structure created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating beneficiary allocation',
      error: error.message
    });
  }
});

// Get policy summary for $40M family protection
router.get('/policy-summary/:policyId', readonlyAccess, async (req, res) => {
  try {
    const { policyId } = req.params;
    
    // Mock policy data - in production, this would come from database
    const policySummary = {
      referenceNumber: '123456789',
      policyId: policyId,
      policyType: 'ROCKEFELLER_FAMILY_PROTECTION_40M',
      coverageBreakdown: {
        policyHolderBenefit: 20000000,
        familyBenefit: 20000000,
        totalCoverage: 40000000
      },
      currentStatus: {
        policyStatus: 'ACTIVE',
        cashValue: 2500000,
        loanBalance: 0,
        premiumsPaid: 1200000,
        yearsInForce: 3
      },
      beneficiaries: [
        {
          name: 'Policy Holder Estate',
          allocation: 20000000,
          percentage: 50
        },
        {
          name: 'Family Protection Trust',
          allocation: 20000000,
          percentage: 50
        }
      ],
      rockefellerEnhancements: {
        multiplier: 1.23456789,
        enhancedDeathBenefit: 49382715.60,
        familyProtectionBonus: true,
        taxProtection: true
      }
    };

    res.status(200).json({
      success: true,
      data: policySummary,
      message: 'Policy summary retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving policy summary',
      error: error.message
    });
  }
});

export default router;
