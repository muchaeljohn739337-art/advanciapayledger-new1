import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  generatePolicyIllustration, 
  validatePolicyEligibility,
  calculatePolicyLoan,
  calculateSurrenderValue,
  calculateDeathBenefit
} from '../services/rockefeller-insurance.service';

const prisma = new PrismaClient();

export class RockefellerInsuranceController {
  // Get policy holder dashboard
  static async getPolicyHolderDashboard(req: Request, res: Response) {
    try {
      const { policyHolderId } = req.params;
      
      const policyHolder = await prisma.rockefellerPolicyHolder.findUnique({
        where: { id: policyHolderId },
        include: {
          policies: {
            include: {
              beneficiaries: true,
              premiumPaymentHistory: true,
              claims: true,
              riders: true
            }
          }
        }
      });

      if (!policyHolder) {
        return res.status(404).json({
          success: false,
          message: 'Policy holder not found'
        });
      }

      // Calculate aggregate values
      const totalCoverage = policyHolder.policies.reduce((sum, policy) => sum + policy.coverageAmount, 0);
      const totalCashValue = policyHolder.policies.reduce((sum, policy) => sum + policy.cashValue, 0);
      const totalPremiums = policyHolder.policies.reduce((sum, policy) => {
        const policyPremiums = policy.premiumPaymentHistory.reduce((pSum, payment) => pSum + payment.amount, 0);
        return sum + policyPremiums;
      }, 0);

      const dashboard = {
        policyHolder: {
          ...policyHolder,
          totalCoverage,
          totalCashValue,
          totalPremiumsPaid: totalPremiums,
          activePolicies: policyHolder.policies.filter(p => p.policyStatus === 'ACTIVE').length,
          pendingClaims: policyHolder.policies.reduce((sum, policy) => 
            sum + policy.claims.filter(c => c.claimStatus === 'PENDING').length, 0)
        },
        policies: policyHolder.policies
      };

      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching dashboard',
        error: error.message
      });
    }
  }

  // Generate policy illustration
  static async generateIllustration(req: Request, res: Response) {
    try {
      const {
        coverageAmount,
        premiumAmount,
        paymentFrequency,
        issueDate,
        currentAge,
        healthRating
      } = req.body;

      const illustration = generatePolicyIllustration(
        coverageAmount,
        premiumAmount,
        paymentFrequency,
        new Date(issueDate),
        currentAge,
        healthRating
      );

      res.status(200).json({
        success: true,
        data: illustration,
        message: 'Policy illustration generated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating illustration',
        error: error.message
      });
    }
  }

  // Validate policy eligibility
  static async validateEligibility(req: Request, res: Response) {
    try {
      const {
        age,
        coverageAmount,
        annualIncome,
        healthRating
      } = req.body;

      const eligibility = validatePolicyEligibility(
        age,
        coverageAmount,
        annualIncome,
        healthRating
      );

      res.status(200).json({
        success: true,
        data: eligibility
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error validating eligibility',
        error: error.message
      });
    }
  }

  // Get policy loan information
  static async getPolicyLoanInfo(req: Request, res: Response) {
    try {
      const { policyId } = req.params;
      const { requestedAmount } = req.body;

      const policy = await prisma.wholeLifePolicy.findUnique({
        where: { id: policyId }
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      const loanInfo = calculatePolicyLoan(
        policy.cashValue,
        requestedAmount,
        policy.loanInterestRate
      );

      res.status(200).json({
        success: true,
        data: loanInfo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating loan information',
        error: error.message
      });
    }
  }

  // Process policy loan
  static async processPolicyLoan(req: Request, res: Response) {
    try {
      const { policyId } = req.params;
      const { loanAmount, interestRate } = req.body;

      const policy = await prisma.wholeLifePolicy.findUnique({
        where: { id: policyId }
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      const loanInfo = calculatePolicyLoan(policy.cashValue, loanAmount, interestRate);

      if (!loanInfo.approved) {
        return res.status(400).json({
          success: false,
          message: 'Loan not approved',
          data: loanInfo
        });
      }

      // Update policy with loan
      const updatedPolicy = await prisma.wholeLifePolicy.update({
        where: { id: policyId },
        data: {
          loanAmount: policy.loanAmount + loanAmount
        }
      });

      res.status(200).json({
        success: true,
        data: {
          policy: updatedPolicy,
          loan: loanInfo
        },
        message: 'Policy loan processed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing policy loan',
        error: error.message
      });
    }
  }

  // Calculate surrender value
  static async calculateSurrenderValue(req: Request, res: Response) {
    try {
      const { policyId } = req.params;

      const policy = await prisma.wholeLifePolicy.findUnique({
        where: { id: policyId },
        include: {
          premiumPaymentHistory: true
        }
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      const totalPremiumsPaid = policy.premiumPaymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
      const expectedAnnualPremium = policy.premiumAmount * (policy.paymentFrequency === 'MONTHLY' ? 12 : 
                                                           policy.paymentFrequency === 'QUARTERLY' ? 4 : 1);
      const yearsInForce = Math.floor((Date.now() - policy.issueDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      const totalPremiumsExpected = expectedAnnualPremium * yearsInForce;

      const surrenderValue = calculateSurrenderValue(
        policy.cashValue,
        policy.issueDate,
        totalPremiumsPaid,
        totalPremiumsExpected
      );

      res.status(200).json({
        success: true,
        data: {
          surrenderValue,
          cashValue: policy.cashValue,
          loanAmount: policy.loanAmount,
          netSurrenderValue: surrenderValue - policy.loanAmount
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating surrender value',
        error: error.message
      });
    }
  }

  // Get Rockefeller family trust information
  static async getFamilyTrusts(req: Request, res: Response) {
    try {
      const trusts = await prisma.rockefellerFamilyTrust.findMany({
        where: {
          referenceNumber: '123456789'
        },
        include: {
          policies: true
        }
      });

      res.status(200).json({
        success: true,
        data: trusts,
        count: trusts.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching family trusts',
        error: error.message
      });
    }
  }

  // Get comprehensive policy report
  static async getPolicyReport(req: Request, res: Response) {
    try {
      const { policyId } = req.params;

      const policy = await prisma.wholeLifePolicy.findUnique({
        where: { id: policyId },
        include: {
          policyHolder: true,
          beneficiaries: true,
          premiumPaymentHistory: true,
          claims: true,
          riders: true
        }
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: 'Policy not found'
        });
      }

      // Calculate additional metrics
      const deathBenefit = calculateDeathBenefit(
        policy.coverageAmount,
        policy.cashValue,
        policy.loanAmount
      );

      const totalPremiumsPaid = policy.premiumPaymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
      const totalClaimsPaid = policy.claims
        .filter(claim => claim.claimStatus === 'PAID')
        .reduce((sum, claim) => sum + claim.claimAmount, 0);

      const report = {
        policy,
        metrics: {
          deathBenefit,
          totalPremiumsPaid,
          totalClaimsPaid,
          netCashValue: policy.cashValue - policy.loanAmount,
          policyValue: deathBenefit + policy.cashValue,
          yearsInForce: Math.floor((Date.now() - policy.issueDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        },
        beneficiaries: policy.beneficiaries,
        riders: policy.riders,
        recentActivity: {
          latestPremium: policy.premiumPaymentHistory[0] || null,
          pendingClaims: policy.claims.filter(c => c.claimStatus === 'PENDING'),
          paidClaims: policy.claims.filter(c => c.claimStatus === 'PAID')
        }
      };

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error generating policy report',
        error: error.message
      });
    }
  }

  // Search policies by reference number
  static async searchByReference(req: Request, res: Response) {
    try {
      const { referenceNumber } = req.params;
      
      const policies = await prisma.wholeLifePolicy.findMany({
        where: {
          referenceNumber: referenceNumber || '123456789'
        },
        include: {
          policyHolder: true,
          beneficiaries: true,
          premiumPaymentHistory: true,
          claims: true,
          riders: true
        }
      });

      res.status(200).json({
        success: true,
        data: policies,
        count: policies.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching policies',
        error: error.message
      });
    }
  }
}
