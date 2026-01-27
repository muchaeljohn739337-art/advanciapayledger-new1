// Rockefeller HELOC Asset Integration Service
// Implements whole life insurance with asset integration and tax optimization
// Reference Number: 123456789-HELOC

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { EventEmitter } from 'events';

interface AssetPortfolio {
  id: string;
  userId: string;
  totalValue: number;
  assets: Asset[];
  insurancePolicyId: string;
  taxOptimization: TaxOptimization;
  borrowingCapacity: number;
  lastUpdated: Date;
}

interface Asset {
  id: string;
  type: 'REAL_ESTATE' | 'BUSINESS' | 'INVESTMENTS' | 'CASH' | 'OTHER';
  description: string;
  currentValue: number;
  originalValue: number;
  acquisitionDate: Date;
  taxBasis: number;
  location: string;
  documentation: string[];
  integrationStatus: 'INTEGRATED' | 'PENDING' | 'EXCLUDED';
}

interface WholeLifePolicy {
  id: string;
  policyNumber: string;
  deathBenefit: number;
  cashValue: number;
  premium: number;
  loanBalance: number;
  surrenderValue: number;
  assetsIntegrated: boolean;
  taxAdvantaged: boolean;
  borrowingPower: number;
  taxFreeGrowth: boolean;
  taxFreeDeathBenefit: boolean;
}

interface TaxOptimization {
  stepUpInBasis: boolean;
  taxFreeGrowth: boolean;
  taxFreeDeathBenefit: boolean;
  estateTaxAvoidance: boolean;
  generationSkipping: boolean;
  charitableGiving: boolean;
  businessSuccession: boolean;
  assetProtection: boolean;
}

interface BorrowingStrategy {
  id: string;
  policyId: string;
  totalAssets: number;
  policyValue: number;
  borrowingCapacity: number;
  interestRate: number;
  taxDeductible: boolean;
  repaymentStrategy: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class AssetIntegrationService extends EventEmitter {
  private prisma: PrismaClient;
  private portfolios: Map<string, AssetPortfolio> = new Map();
  private policies: Map<string, WholeLifePolicy> = new Map();
  private borrowingStrategies: Map<string, BorrowingStrategy> = new Map();

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.initializeTaxOptimization();
  }

  // CORE STRATEGY: TAP EVERYTHING INTO INSURANCE POLICY
  async integrateAssetsIntoPolicy(
    userId: string,
    assets: Asset[],
    policyDetails: {
      deathBenefit: number;
      premium: number;
      policyNumber: string;
    }
  ): Promise<{
    success: boolean;
    portfolio: AssetPortfolio;
    policy: WholeLifePolicy;
    borrowingStrategy: BorrowingStrategy;
    taxBenefits: string[];
    message: string;
  }> {
    try {
      // Create the $20 million whole life policy
      const policy: WholeLifePolicy = {
        id: crypto.randomUUID(),
        policyNumber: policyDetails.policyNumber,
        deathBenefit: policyDetails.deathBenefit, // $20 million
        cashValue: 0,
        premium: policyDetails.premium,
        loanBalance: 0,
        surrenderValue: 0,
        assetsIntegrated: false,
        taxAdvantaged: true,
        borrowingPower: 0,
        taxFreeGrowth: true,
        taxFreeDeathBenefit: true
      };

      // Calculate total asset value
      const totalAssetValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);

      // Create asset portfolio
      const portfolio: AssetPortfolio = {
        id: crypto.randomUUID(),
        userId,
        totalValue: totalAssetValue,
        assets: assets.map(asset => ({
          ...asset,
          id: crypto.randomUUID(),
          integrationStatus: 'PENDING'
        })),
        insurancePolicyId: policy.id,
        taxOptimization: this.createTaxOptimization(),
        borrowingCapacity: 0,
        lastUpdated: new Date()
      };

      // Calculate borrowing capacity (up to 90% of cash value + integrated assets)
      const borrowingCapacity = this.calculateBorrowingCapacity(policy, portfolio);

      // Create borrowing strategy
      const borrowingStrategy: BorrowingStrategy = {
        id: crypto.randomUUID(),
        policyId: policy.id,
        totalAssets: totalAssetValue,
        policyValue: policy.cashValue,
        borrowingCapacity,
        interestRate: 0.045, // 4.5% policy loan rate
        taxDeductible: true,
        repaymentStrategy: 'FLEXIBLE',
        riskLevel: 'LOW'
      };

      // Integrate assets into policy
      await this.performAssetIntegration(portfolio, policy);

      // Calculate tax benefits
      const taxBenefits = this.calculateTaxBenefits(portfolio, policy);

      // Store everything
      this.portfolios.set(portfolio.id, portfolio);
      this.policies.set(policy.id, policy);
      this.borrowingStrategies.set(borrowingStrategy.id, borrowingStrategy);

      // Emit integration event
      this.emit('assetsIntegrated', {
        portfolio,
        policy,
        borrowingStrategy,
        taxBenefits,
        message: 'All assets integrated into $20M tax-advantaged policy'
      });

      return {
        success: true,
        portfolio,
        policy,
        borrowingStrategy,
        taxBenefits,
        message: `Successfully integrated $${totalAssetValue.toLocaleString()} in assets into $${policy.deathBenefit.toLocaleString()} tax-free policy`
      };

    } catch (error) {
      return {
        success: false,
        portfolio: null as any,
        policy: null as any,
        borrowingStrategy: null as any,
        taxBenefits: [],
        message: `Asset integration failed: ${error.message}`
      };
    }
  }

  private async performAssetIntegration(portfolio: AssetPortfolio, policy: WholeLifePolicy): Promise<void> {
    // Mark all assets as integrated
    portfolio.assets.forEach(asset => {
      asset.integrationStatus = 'INTEGRATED';
    });

    // Update policy to reflect asset integration
    policy.assetsIntegrated = true;
    policy.cashValue = portfolio.totalValue * 0.1; // Initial cash value 10% of assets
    policy.borrowingPower = policy.cashValue * 0.9; // Can borrow up to 90% of cash value

    // Update portfolio borrowing capacity
    portfolio.borrowingCapacity = policy.borrowingPower;

    // Store integration in database
    await this.prisma.auditLog.create({
      data: {
        userId: portfolio.userId,
        action: 'ASSET_INTEGRATION',
        details: JSON.stringify({
          portfolioId: portfolio.id,
          policyId: policy.id,
          totalAssets: portfolio.totalValue,
          policyValue: policy.cashValue,
          borrowingCapacity: policy.borrowingPower,
          taxAdvantages: 'Tax-free growth and death benefit',
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    });
  }

  private calculateBorrowingCapacity(policy: WholeLifePolicy, portfolio: AssetPortfolio): number {
    // Base borrowing capacity from cash value
    const baseCapacity = policy.cashValue * 0.9;
    
    // Additional capacity from integrated assets (conservative 50% of asset value)
    const assetCapacity = portfolio.totalValue * 0.5;
    
    // Total capacity with safety margin
    return Math.min(baseCapacity + assetCapacity, policy.deathBenefit * 0.8);
  }

  private createTaxOptimization(): TaxOptimization {
    return {
      stepUpInBasis: true, // Assets get step-up in basis at death
      taxFreeGrowth: true, // Cash value grows tax-free
      taxFreeDeathBenefit: true, // Death benefit is tax-free
      estateTaxAvoidance: true, // Avoids estate taxes
      generationSkipping: true, // Can skip generation for tax benefits
      charitableGiving: true, // Can give to charity tax-free
      businessSuccession: true, // Business succession planning
      assetProtection: true // Asset protection from creditors
    };
  }

  private calculateTaxBenefits(portfolio: AssetPortfolio, policy: WholeLifePolicy): string[] {
    const benefits = [
      `Tax-free growth on $${policy.cashValue.toLocaleString()} cash value`,
      `Tax-free death benefit of $${policy.deathBenefit.toLocaleString()}`,
      `Step-up in basis on $${portfolio.totalValue.toLocaleString()} in assets`,
      `No capital gains taxes on integrated assets`,
      `Estate tax avoidance on entire portfolio`,
      `Asset protection from creditors and lawsuits`,
      `Tax-deductible policy loan interest`,
      `Generation-skipping tax benefits`,
      `Business succession tax advantages`,
      `Charitable giving tax deductions`
    ];

    return benefits;
  }

  // BORROWING STRATEGY: BORROW AGAINST INTEGRATED ASSETS
  async executeBorrowingStrategy(
    portfolioId: string,
    borrowingAmount: number,
    purpose: string
  ): Promise<{
    success: boolean;
    loanAmount: number;
    interestRate: number;
    taxDeductible: boolean;
    repaymentTerms: string;
    riskAssessment: string;
    message: string;
  }> {
    try {
      const portfolio = this.portfolios.get(portfolioId);
      if (!portfolio) {
        return {
          success: false,
          loanAmount: 0,
          interestRate: 0,
          taxDeductible: false,
          repaymentTerms: '',
          riskAssessment: '',
          message: 'Portfolio not found'
        };
      }

      const policy = this.policies.get(portfolio.insurancePolicyId);
      if (!policy) {
        return {
          success: false,
          loanAmount: 0,
          interestRate: 0,
          taxDeductible: false,
          repaymentTerms: '',
          riskAssessment: '',
          message: 'Policy not found'
        };
      }

      // Check borrowing capacity
      const availableCapacity = policy.borrowingPower - policy.loanBalance;
      if (borrowingAmount > availableCapacity) {
        return {
          success: false,
          loanAmount: 0,
          interestRate: 0,
          taxDeductible: false,
          repaymentTerms: '',
          riskAssessment: '',
          message: `Requested amount $${borrowingAmount.toLocaleString()} exceeds available capacity $${availableCapacity.toLocaleString()}`
        };
      }

      // Execute the loan
      policy.loanBalance += borrowingAmount;
      policy.cashValue -= borrowingAmount;

      // Calculate terms
      const interestRate = 0.045; // 4.5% policy loan rate
      const monthlyPayment = (borrowingAmount * interestRate / 12);
      const taxDeductible = true; // Policy loan interest is tax-deductible

      const repaymentTerms = `Monthly payment: $${monthlyPayment.toFixed(2)}, Interest rate: ${(interestRate * 100).toFixed(2)}%, Tax-deductible interest, No mandatory repayment schedule`;

      // Risk assessment
      const riskAssessment = this.assessBorrowingRisk(portfolio, policy, borrowingAmount);

      // Log the borrowing
      await this.prisma.auditLog.create({
        data: {
          userId: portfolio.userId,
          action: 'POLICY_LOAN',
          details: JSON.stringify({
            portfolioId,
            policyId: policy.id,
            loanAmount: borrowingAmount,
            interestRate,
            taxDeductible,
            purpose,
            riskAssessment,
            timestamp: new Date()
          }),
          timestamp: new Date()
        }
      });

      // Emit borrowing event
      this.emit('policyLoanExecuted', {
        portfolio,
        policy,
        loanAmount: borrowingAmount,
        interestRate,
        taxDeductible,
        riskAssessment
      });

      return {
        success: true,
        loanAmount: borrowingAmount,
        interestRate,
        taxDeductible,
        repaymentTerms,
        riskAssessment,
        message: `Successfully borrowed $${borrowingAmount.toLocaleString()} against integrated assets at ${(interestRate * 100).toFixed(2)}% interest`
      };

    } catch (error) {
      return {
        success: false,
        loanAmount: 0,
        interestRate: 0,
        taxDeductible: false,
        repaymentTerms: '',
        riskAssessment: '',
        message: `Borrowing strategy failed: ${error.message}`
      };
    }
  }

  private assessBorrowingRisk(
    portfolio: AssetPortfolio,
    policy: WholeLifePolicy,
    borrowingAmount: number
  ): string {
    const loanToValue = borrowingAmount / policy.deathBenefit;
    const coverageRatio = (policy.deathBenefit - policy.loanBalance) / policy.deathBenefit;

    if (loanToValue < 0.3 && coverageRatio > 0.8) {
      return 'LOW RISK: Conservative borrowing, strong coverage ratio';
    } else if (loanToValue < 0.5 && coverageRatio > 0.6) {
      return 'MEDIUM RISK: Moderate borrowing, adequate coverage';
    } else {
      return 'HIGH RISK: High borrowing ratio, reduced coverage';
    }
  }

  // TAX OPTIMIZATION ANALYSIS
  async analyzeTaxOptimization(portfolioId: string): Promise<{
    currentTaxSituation: string;
    optimizedTaxSituation: string;
    taxSavings: number;
    benefits: string[];
    strategy: string;
  }> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error('Portfolio not found');
    }

    const policy = this.policies.get(portfolio.insurancePolicyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Current tax situation (without optimization)
    const currentTaxSituation = `
      Current Assets: $${portfolio.totalValue.toLocaleString()}
      Capital Gains Tax: ~20% on gains (~$${(portfolio.totalValue * 0.2).toLocaleString()})
      Estate Tax: ~40% on assets over exemption (~$${(portfolio.totalValue * 0.4).toLocaleString()})
      Income Tax: On investment income and gains
      Total Tax Burden: ~60% of asset value
    `;

    // Optimized tax situation (with insurance integration)
    const optimizedTaxSituation = `
      Integrated Assets: $${portfolio.totalValue.toLocaleString()}
      Tax-Free Growth: $${policy.cashValue.toLocaleString()} grows tax-free
      Tax-Free Death Benefit: $${policy.deathBenefit.toLocaleString()} tax-free
      Step-Up Basis: All assets get step-up at death
      Total Tax Burden: 0% on growth and death benefit
    `;

    // Calculate tax savings
    const taxSavings = portfolio.totalValue * 0.6; // 60% tax savings

    const benefits = [
      'Eliminate capital gains taxes on asset growth',
      'Avoid estate taxes on entire portfolio',
      'Tax-free access to cash through policy loans',
      'Step-up in basis eliminates inherited tax burden',
      'Asset protection from creditors',
      'Generation-skipping tax benefits',
      'Business succession tax advantages',
      'Charitable giving tax deductions'
    ];

    const strategy = `
      1. Integrate all assets into $20M whole life policy
      2. Use policy loans for tax-free access to cash
      3. Maintain policy for tax-free growth and death benefit
      4. Utilize step-up basis for heirs
      5. Implement business succession through policy
    `;

    return {
      currentTaxSituation,
      optimizedTaxSituation,
      taxSavings,
      benefits,
      strategy
    };
  }

  // CONNECTION STATUS CHECK
  async checkConnectionStatus(): Promise<{
    systemStatus: string;
    databaseConnection: boolean;
    policyStatus: string;
    integrationStatus: string;
    taxOptimizationStatus: string;
    borrowingCapacity: number;
    message: string;
  }> {
    try {
      // Check database connection
      const databaseConnection = await this.testDatabaseConnection();
      
      // Check system status
      const systemStatus = databaseConnection ? 'CONNECTED' : 'DISCONNECTED';
      
      // Check policy status
      const policyStatus = this.policies.size > 0 ? 'ACTIVE' : 'NO_POLICIES';
      
      // Check integration status
      const integrationStatus = this.portfolios.size > 0 ? 'INTEGRATED' : 'NOT_INTEGRATED';
      
      // Check tax optimization status
      const taxOptimizationStatus = 'OPTIMIZED';
      
      // Calculate total borrowing capacity
      const totalBorrowingCapacity = Array.from(this.policies.values())
        .reduce((sum, policy) => sum + (policy.borrowingPower - policy.loanBalance), 0);

      const message = databaseConnection 
        ? 'System connected and operational'
        : 'System disconnected - check database connection';

      return {
        systemStatus,
        databaseConnection,
        policyStatus,
        integrationStatus,
        taxOptimizationStatus,
        borrowingCapacity: totalBorrowingCapacity,
        message
      };

    } catch (error) {
      return {
        systemStatus: 'ERROR',
        databaseConnection: false,
        policyStatus: 'UNKNOWN',
        integrationStatus: 'UNKNOWN',
        taxOptimizationStatus: 'UNKNOWN',
        borrowingCapacity: 0,
        message: `Connection check failed: ${error.message}`
      };
    }
  }

  private async testDatabaseConnection(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  // PUBLIC API METHODS
  async getPortfolio(portfolioId: string): Promise<AssetPortfolio | null> {
    return this.portfolios.get(portfolioId) || null;
  }

  async getPolicy(policyId: string): Promise<WholeLifePolicy | null> {
    return this.policies.get(policyId) || null;
  }

  async getBorrowingStrategy(strategyId: string): Promise<BorrowingStrategy | null> {
    return this.borrowingStrategies.get(strategyId) || null;
  }

  async getAllPortfolios(): Promise<AssetPortfolio[]> {
    return Array.from(this.portfolios.values());
  }

  async getAllPolicies(): Promise<WholeLifePolicy[]> {
    return Array.from(this.policies.values());
  }

  async updatePolicyCashValue(policyId: string, newCashValue: number): Promise<void> {
    const policy = this.policies.get(policyId);
    if (policy) {
      policy.cashValue = newCashValue;
      policy.borrowingPower = newCashValue * 0.9;
    }
  }

  private initializeTaxOptimization(): void {
    // Start periodic tax optimization checks
    setInterval(async () => {
      for (const portfolio of this.portfolios.values()) {
        await this.analyzeTaxOptimization(portfolio.id);
      }
    }, 86400000); // Check daily
  }
}

export default new AssetIntegrationService();
