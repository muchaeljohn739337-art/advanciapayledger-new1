// Rockefeller HELOC Whole Life Insurance Service
// Implements comprehensive whole life insurance with cancel money philosophy
// Reference Number: 123456789-HELOC

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { EventEmitter } from 'events';

interface WholeLifePolicy {
  id: string;
  policyNumber: string;
  userId: string;
  type: 'WHOLE_LIFE';
  status: 'ACTIVE' | 'CANCELLED' | 'PAID_UP' | 'SURRENDERED';
  coverageAmount: number;
  premium: number;
  cashValue: number;
  deathBenefit: number;
  loanBalance: number;
  surrenderValue: number;
  paidUpAdditions: number;
  dividends: number;
  interestRate: number;
  issueDate: Date;
  maturityDate: Date;
  lastPremiumDate: Date;
  beneficiaries: Beneficiary[];
  riders: PolicyRider[];
  cancelationHistory: CancelationRecord[];
  profitabilityMetrics: PolicyProfitability;
}

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
  contingent: boolean;
  dateOfBirth: Date;
  contactInfo: string;
}

interface PolicyRider {
  id: string;
  type: 'WAIVER_OF_PREMIUM' | 'ACCELERATED_DEATH_BENEFIT' | 'LONG_TERM_CARE' | 'DISABILITY_WAIVER';
  premium: number;
  benefit: number;
  active: boolean;
  startDate: Date;
  endDate?: Date;
}

interface CancelationRecord {
  id: string;
  type: 'PREMIUM_CANCELLATION' | 'POLICY_CANCELLATION' | 'RIDER_CANCELLATION';
  amount: number;
  reason: string;
  date: Date;
  profitFromCancelation: number;
  riskReduction: number;
  approvedBy: string;
}

interface PolicyProfitability {
  totalPremiumsPaid: number;
  totalClaimsPaid: number;
  totalExpenses: number;
  totalInvestmentIncome: number;
  cancelationProfit: number;
  netProfit: number;
  profitMargin: number;
  riskAdjustedReturn: number;
}

export class WholeLifeInsuranceService extends EventEmitter {
  private prisma: PrismaClient;
  private policies: Map<string, WholeLifePolicy> = new Map();
  private cancelationStrategies: Map<string, any> = new Map();
  private profitabilityMetrics: Map<string, PolicyProfitability> = new Map();

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.initializeCancelationStrategies();
    this.startProfitabilityTracking();
  }

  // POLICY CREATION WITH CANCEL MONEY PHILOSOPHY
  async createWholeLifePolicy(data: {
    userId: string;
    coverageAmount: number;
    premium: number;
    term: number; // years until maturity (typically 100 or 121)
    beneficiaries: Array<{
      name: string;
      relationship: string;
      percentage: number;
      contingent: boolean;
      dateOfBirth: Date;
      contactInfo: string;
    }>;
    riders?: Array<{
      type: string;
      benefit: number;
    }>;
  }): Promise<{
    success: boolean;
    policy?: WholeLifePolicy;
    message: string;
  }> {
    try {
      // Generate policy number
      const policyNumber = this.generatePolicyNumber();

      // Calculate policy parameters
      const issueDate = new Date();
      const maturityDate = new Date(issueDate);
      maturityDate.setFullYear(maturityDate.getFullYear() + data.term);

      // Initial cash value (typically starts low)
      const initialCashValue = data.premium * 0.1; // 10% of first premium

      // Calculate cancelation profitability
      const cancelationProfit = await this.calculatePolicyCancelationProfitability(data);

      // Create the policy
      const policy: WholeLifePolicy = {
        id: crypto.randomUUID(),
        policyNumber,
        userId: data.userId,
        type: 'WHOLE_LIFE',
        status: 'ACTIVE',
        coverageAmount: data.coverageAmount,
        premium: data.premium,
        cashValue: initialCashValue,
        deathBenefit: data.coverageAmount,
        loanBalance: 0,
        surrenderValue: initialCashValue * 0.8, // 80% of cash value
        paidUpAdditions: 0,
        dividends: 0,
        interestRate: 0.045, // 4.5% guaranteed interest
        issueDate,
        maturityDate,
        lastPremiumDate: issueDate,
        beneficiaries: data.beneficiaries.map(b => ({
          ...b,
          id: crypto.randomUUID()
        })),
        riders: await this.createPolicyRiders(data.riders || []),
        cancelationHistory: [],
        profitabilityMetrics: {
          totalPremiumsPaid: data.premium,
          totalClaimsPaid: 0,
          totalExpenses: data.premium * 0.15, // 15% expenses
          totalInvestmentIncome: 0,
          cancelationProfit: cancelationProfit.profit,
          netProfit: cancelationProfit.profit - (data.premium * 0.15),
          profitMargin: cancelationProfit.profit / data.premium,
          riskAdjustedReturn: cancelationProfit.riskReduction
        }
      };

      // Store policy
      this.policies.set(policy.id, policy);
      this.profitabilityMetrics.set(policy.id, policy.profitabilityMetrics);

      // Create database record
      await this.prisma.wholeLifePolicy.create({
        data: {
          id: policy.id,
          policyNumber: policy.policyNumber,
          userId: policy.userId,
          coverageAmount: policy.coverageAmount,
          premium: policy.premium,
          cashValue: policy.cashValue,
          deathBenefit: policy.deathBenefit,
          interestRate: policy.interestRate,
          issueDate: policy.issueDate,
          maturityDate: policy.maturityDate,
          status: policy.status
        }
      });

      // Apply cancel money philosophy
      await this.applyCancelMoneyPhilosophy(policy);

      // Emit policy creation event
      this.emit('policyCreated', {
        policy,
        cancelationProfit,
        philosophy: 'Policy created with cancelation profitability built in'
      });

      return {
        success: true,
        policy,
        message: `Whole Life Policy ${policyNumber} created with built-in cancelation profitability`
      };

    } catch (error) {
      return {
        success: false,
        message: `Policy creation failed: ${error.message}`
      };
    }
  }

  // CANCEL MONEY PHILOSOPHY IMPLEMENTATION
  private async calculatePolicyCancelationProfitability(policyData: any): Promise<{
    profit: number;
    riskReduction: number;
    strategy: string;
  }> {
    // Calculate profit from potential policy cancelation
    const baseProfit = policyData.premium * 0.25; // 25% profit from cancelation
    const riskReduction = policyData.coverageAmount * 0.1; // 10% risk reduction
    
    // Apply cancelation strategies
    const strategy = this.selectCancelationStrategy(policyData);
    const adjustedProfit = baseProfit * strategy.profitMultiplier;
    const adjustedRiskReduction = riskReduction * strategy.riskMultiplier;

    return {
      profit: adjustedProfit,
      riskReduction: adjustedRiskReduction,
      strategy: strategy.name
    };
  }

  private selectCancelationStrategy(policyData: any): any {
    // Select appropriate cancelation strategy based on policy characteristics
    if (policyData.coverageAmount > 1000000) {
      return {
        name: 'High-Value Policy Cancelation',
        profitMultiplier: 1.5,
        riskMultiplier: 1.3
      };
    } else if (policyData.premium > 1000) {
      return {
        name: 'High-Premium Policy Cancelation',
        profitMultiplier: 1.2,
        riskMultiplier: 1.1
      };
    } else {
      return {
        name: 'Standard Policy Cancelation',
        profitMultiplier: 1.0,
        riskMultiplier: 1.0
      };
    }
  }

  private async applyCancelMoneyPhilosophy(policy: WholeLifePolicy): Promise<void> {
    // Apply cancel money philosophy to policy management
    const cancelationOpportunities = await this.identifyCancelationOpportunities(policy);
    
    // Log philosophy application
    await this.prisma.auditLog.create({
      data: {
        userId: policy.userId,
        action: 'CANCEL_MONEY_PHILOSOPHY_APPLIED',
        details: JSON.stringify({
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          philosophy: 'We make money by canceling money',
          cancelationOpportunities: cancelationOpportunities.length,
          potentialProfit: cancelationOpportunities.reduce((sum, opp) => sum + opp.profit, 0),
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    });
  }

  // PREMIUM CANCELLATION (MAKE MONEY BY CANCELLING)
  async cancelPremium(policyId: string, reason: string, canceledBy: string): Promise<{
    success: boolean;
    profit: number;
    riskReduction: number;
    message: string;
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        success: false,
        profit: 0,
        riskReduction: 0,
        message: 'Policy not found'
      };
    }

    // Calculate profit from premium cancelation
    const profit = policy.premium * 0.3; // 30% profit from premium cancelation
    const riskReduction = policy.coverageAmount * 0.05; // 5% risk reduction

    // Record cancelation
    const cancelationRecord: CancelationRecord = {
      id: crypto.randomUUID(),
      type: 'PREMIUM_CANCELLATION',
      amount: policy.premium,
      reason: this.enhanceReasonWithPhilosophy(reason),
      date: new Date(),
      profitFromCancelation: profit,
      riskReduction,
      approvedBy: canceledBy
    };

    policy.cancelationHistory.push(cancelationRecord);
    policy.profitabilityMetrics.cancelationProfit += profit;
    policy.profitabilityMetrics.netProfit += profit;

    // Update policy status
    policy.lastPremiumDate = new Date();

    // Log cancelation
    await this.logCancelation(policy, cancelationRecord);

    // Emit cancelation event
    this.emit('premiumCanceled', {
      policy,
      cancelationRecord,
      profit,
      philosophy: 'Money made by canceling premium'
    });

    return {
      success: true,
      profit,
      riskReduction,
      message: `Premium canceled for profit: $${profit.toFixed(2)}`
    };
  }

  // POLICY CANCELLATION (ULTIMATE CANCEL MONEY STRATEGY)
  async cancelPolicy(policyId: string, reason: string, canceledBy: string): Promise<{
    success: boolean;
    surrenderValue: number;
    cancelationProfit: number;
    totalRiskReduction: number;
    message: string;
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        success: false,
        surrenderValue: 0,
        cancelationProfit: 0,
        totalRiskReduction: 0,
        message: 'Policy not found'
      };
    }

    // Calculate surrender value
    const surrenderValue = policy.cashValue * 0.9; // 90% of cash value

    // Calculate cancelation profit (the core philosophy)
    const cancelationProfit = surrenderValue * 0.4; // 40% profit from policy cancelation
    const totalRiskReduction = policy.coverageAmount * 0.8; // 80% risk elimination

    // Record cancelation
    const cancelationRecord: CancelationRecord = {
      id: crypto.randomUUID(),
      type: 'POLICY_CANCELLATION',
      amount: surrenderValue,
      reason: this.enhanceReasonWithPhilosophy(reason),
      date: new Date(),
      profitFromCancelation: cancelationProfit,
      riskReduction: totalRiskReduction,
      approvedBy: canceledBy
    };

    policy.cancelationHistory.push(cancelationRecord);
    policy.status = 'CANCELLED';
    policy.profitabilityMetrics.cancelationProfit += cancelationProfit;
    policy.profitabilityMetrics.netProfit += cancelationProfit;

    // Update profitability metrics
    this.profitabilityMetrics.set(policyId, policy.profitabilityMetrics);

    // Log cancelation
    await this.logCancelation(policy, cancelationRecord);

    // Emit cancelation event
    this.emit('policyCanceled', {
      policy,
      cancelationRecord,
      surrenderValue,
      cancelationProfit,
      philosophy: 'Maximum profit achieved through policy cancelation'
    });

    return {
      success: true,
      surrenderValue,
      cancelationProfit,
      totalRiskReduction,
      message: `Policy canceled for maximum profit: $${cancelationProfit.toFixed(2)}`
    };
  }

  // CASH VALUE MANAGEMENT WITH CANCELATION OPPORTUNITIES
  async manageCashValue(policyId: string): Promise<{
    currentCashValue: number;
    projectedGrowth: number;
    cancelationOpportunities: Array<{
      type: string;
      potentialProfit: number;
      riskReduction: number;
      timing: string;
    }>;
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Calculate current cash value with interest
    const monthsSinceIssue = Math.floor((Date.now() - policy.issueDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const interestAccumulated = policy.cashValue * Math.pow(1 + policy.interestRate / 12, monthsSinceIssue) - policy.cashValue;
    const currentCashValue = policy.cashValue + interestAccumulated;

    // Project growth
    const projectedGrowth = currentCashValue * (1 + policy.interestRate) * 12; // 12 months projection

    // Identify cancelation opportunities
    const cancelationOpportunities = await this.identifyCancelationOpportunities(policy);

    return {
      currentCashValue,
      projectedGrowth,
      cancelationOpportunities
    };
  }

  private async identifyCancelationOpportunities(policy: WholeLifePolicy): Promise<Array<{
    type: string;
    potentialProfit: number;
    riskReduction: number;
    timing: string;
  }>> {
    const opportunities = [];

    // Premium cancelation opportunity
    if (policy.status === 'ACTIVE') {
      opportunities.push({
        type: 'Premium Cancelation',
        potentialProfit: policy.premium * 0.3,
        riskReduction: policy.coverageAmount * 0.05,
        timing: 'Immediate'
      });
    }

    // Policy cancelation opportunity
    if (policy.cashValue > policy.premium * 12) { // If cash value exceeds 12 premiums
      opportunities.push({
        type: 'Full Policy Cancelation',
        potentialProfit: policy.cashValue * 0.4,
        riskReduction: policy.coverageAmount * 0.8,
        timing: 'Optimal'
      });
    }

    // Rider cancelation opportunities
    policy.riders.forEach(rider => {
      if (rider.active) {
        opportunities.push({
          type: `${rider.type} Rider Cancelation`,
          potentialProfit: rider.premium * 0.5,
          riskReduction: rider.benefit * 0.1,
          timing: 'Immediate'
        });
      }
    });

    return opportunities;
  }

  // POLICY LOAN MANAGEMENT (ANOTHER CANCELATION OPPORTUNITY)
  async managePolicyLoan(policyId: string, loanAmount: number): Promise<{
    success: boolean;
    loanApproved: boolean;
    cancelationProfit: number;
    message: string;
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        success: false,
        loanApproved: false,
        cancelationProfit: 0,
        message: 'Policy not found'
      };
    }

    // Check if loan is possible (max 90% of cash value)
    const maxLoan = policy.cashValue * 0.9;
    if (loanAmount > maxLoan) {
      return {
        success: false,
        loanApproved: false,
        cancelationProfit: 0,
        message: `Loan amount exceeds maximum (${maxLoan.toFixed(2)})`
      };
    }

    // Calculate cancelation profit from loan
    const cancelationProfit = loanAmount * 0.15; // 15% profit from loan cancelation

    // Approve loan
    policy.loanBalance += loanAmount;
    policy.cashValue -= loanAmount;

    // Record cancelation
    const cancelationRecord: CancelationRecord = {
      id: crypto.randomUUID(),
      type: 'PREMIUM_CANCELLATION', // Using this type for loan cancelation
      amount: loanAmount,
      reason: `Policy loan with cancelation profit: ${this.enhanceReasonWithPhilosophy('Policy loan for cash value access')}`,
      date: new Date(),
      profitFromCancelation: cancelationProfit,
      riskReduction: loanAmount * 0.1,
      approvedBy: 'SYSTEM'
    };

    policy.cancelationHistory.push(cancelationRecord);
    policy.profitabilityMetrics.cancelationProfit += cancelationProfit;

    return {
      success: true,
      loanApproved: true,
      cancelationProfit,
      message: `Policy loan approved with cancelation profit: $${cancelationProfit.toFixed(2)}`
    };
  }

  // DIVIDEND MANAGEMENT WITH CANCELATION FOCUS
  async manageDividends(policyId: string): Promise<{
    dividendAmount: number;
    cancelationOptions: Array<{
      option: string;
      profit: number;
      riskReduction: number;
    }>;
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      throw new Error('Policy not found');
    }

    // Calculate dividend (typically 5-8% of cash value)
    const dividendAmount = policy.cashValue * 0.06; // 6% dividend

    // Calculate cancelation options for dividend
    const cancelationOptions = [
      {
        option: 'Cancel Dividend for Cash',
        profit: dividendAmount * 0.2, // 20% profit from dividend cancelation
        riskReduction: 0
      },
      {
        option: 'Apply to Premium (Cancel Premium)',
        profit: policy.premium * 0.25, // 25% profit from premium reduction
        riskReduction: policy.coverageAmount * 0.03
      },
      {
        option: 'Purchase Paid-Up Additions',
        profit: dividendAmount * 0.15, // 15% profit from additions
        riskReduction: policy.coverageAmount * 0.02
      }
    ];

    return {
      dividendAmount,
      cancelationOptions
    };
  }

  // BENEFICIARY MANAGEMENT WITH CANCELATION PROTECTION
  async updateBeneficiaries(policyId: string, beneficiaries: any[]): Promise<{
    success: boolean;
    cancelationRisk: number;
    protectionStrategies: string[];
  }> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        success: false,
        cancelationRisk: 0,
        protectionStrategies: []
      };
    }

    // Update beneficiaries
    policy.beneficiaries = beneficiaries.map(b => ({
      ...b,
      id: b.id || crypto.randomUUID()
    }));

    // Calculate cancelation risk
    const cancelationRisk = beneficiaries.length > 3 ? 0.3 : 0.1; // More beneficiaries = higher risk

    // Protection strategies
    const protectionStrategies = [
      'Implement contingent beneficiary structure',
      'Use irrevocable beneficiary designations',
      'Create trust structures for benefit distribution',
      'Apply cancelation protection clauses'
    ];

    return {
      success: true,
      cancelationRisk,
      protectionStrategies
    };
  }

  // UTILITY METHODS
  private generatePolicyNumber(): string {
    const prefix = 'WL'; // Whole Life
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${prefix}${year}${random}`;
  }

  private async createPolicyRiders(riderData: any[]): Promise<PolicyRider[]> {
    const riders: PolicyRider[] = [];

    for (const rider of riderData) {
      const policyRider: PolicyRider = {
        id: crypto.randomUUID(),
        type: rider.type as any,
        premium: rider.benefit * 0.05, // 5% of benefit as premium
        benefit: rider.benefit,
        active: true,
        startDate: new Date()
      };
      riders.push(policyRider);
    }

    return riders;
  }

  private enhanceReasonWithPhilosophy(reason: string): string {
    const philosophyPrefixes = [
      "Canceling for profit: ",
      "Money made by canceling: ",
      "Risk eliminated through cancellation: ",
      "Value destruction creates value: ",
      "Cancelation philosophy in action: "
    ];

    const prefix = philosophyPrefixes[Math.floor(Math.random() * philosophyPrefixes.length)];
    return prefix + reason;
  }

  private async logCancelation(policy: WholeLifePolicy, cancelationRecord: CancelationRecord): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId: policy.userId,
        action: 'POLICY_CANCELLATION',
        details: JSON.stringify({
          policyId: policy.id,
          policyNumber: policy.policyNumber,
          cancelationType: cancelationRecord.type,
          amount: cancelationRecord.amount,
          profit: cancelationRecord.profitFromCancelation,
          riskReduction: cancelationRecord.riskReduction,
          reason: cancelationRecord.reason,
          philosophy: 'We make money by canceling money',
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    });
  }

  // PROFITABILITY TRACKING
  private startProfitabilityTracking(): void {
    setInterval(async () => {
      await this.updateProfitabilityMetrics();
    }, 60000); // Update every minute
  }

  private async updateProfitabilityMetrics(): Promise<void> {
    for (const [policyId, policy] of this.policies) {
      // Update investment income
      const monthlyIncome = policy.cashValue * (policy.interestRate / 12);
      policy.profitabilityMetrics.totalInvestmentIncome += monthlyIncome;

      // Update net profit
      policy.profitabilityMetrics.netProfit = 
        policy.profitabilityMetrics.totalInvestmentIncome +
        policy.profitabilityMetrics.cancelationProfit -
        policy.profitabilityMetrics.totalExpenses;

      // Update profit margin
      if (policy.profitabilityMetrics.totalPremiumsPaid > 0) {
        policy.profitabilityMetrics.profitMargin = 
          policy.profitabilityMetrics.netProfit / policy.profitabilityMetrics.totalPremiumsPaid;
      }

      this.profitabilityMetrics.set(policyId, policy.profitabilityMetrics);
    }
  }

  // CANCELATION STRATEGIES INITIALIZATION
  private initializeCancelationStrategies(): void {
    const strategies = [
      {
        id: 'premium-cancelation',
        name: 'Premium Cancelation Strategy',
        description: 'Cancel premiums for immediate profit',
        profitMultiplier: 1.3,
        riskMultiplier: 1.1
      },
      {
        id: 'policy-cancelation',
        name: 'Policy Cancelation Strategy',
        description: 'Cancel entire policy for maximum profit',
        profitMultiplier: 1.5,
        riskMultiplier: 1.8
      },
      {
        id: 'rider-cancelation',
        name: 'Rider Cancelation Strategy',
        description: 'Cancel policy riders for targeted profit',
        profitMultiplier: 1.2,
        riskMultiplier: 1.0
      }
    ];

    strategies.forEach(strategy => {
      this.cancelationStrategies.set(strategy.id, strategy);
    });
  }

  // PUBLIC API METHODS
  async getPolicyDetails(policyId: string): Promise<WholeLifePolicy | null> {
    return this.policies.get(policyId) || null;
  }

  async getPolicyProfitability(policyId: string): Promise<PolicyProfitability | null> {
    return this.profitabilityMetrics.get(policyId) || null;
  }

  async getAllPolicies(): Promise<WholeLifePolicy[]> {
    return Array.from(this.policies.values());
  }

  async getCancelationOpportunities(policyId: string): Promise<Array<{
    type: string;
    potentialProfit: number;
    riskReduction: number;
    timing: string;
  }>> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return [];
    }

    return this.identifyCancelationOpportunities(policy);
  }
}

export default new WholeLifeInsuranceService();
