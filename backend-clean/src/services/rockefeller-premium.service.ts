// Rockefeller Premium Calculation Service
// Specialized for $20M + $20M Family Protection Plan
// Reference Number: 123456789

export interface PremiumCalculation {
  coverageAmount: number;
  monthlyPremium: number;
  annualPremium: number;
  cashValueProjection: number[];
  deathBenefit: number;
  rockefellerEnhancement: number;
}

export interface FamilyProtectionPlan {
  policyHolderBenefit: number;    // $20,000,000
  familyBenefit: number;          // $20,000,000
  totalCoverage: number;          // $40,000,000
  premiumStructure: PremiumCalculation;
  beneficiaries: BeneficiaryStructure[];
  trustProtection: TrustProtection;
}

export interface BeneficiaryStructure {
  name: string;
  relationship: string;
  allocationAmount: number;
  percentage: number;
  isContingent: boolean;
  protectionType: 'immediate' | 'trust' | 'installment';
}

export interface TrustProtection {
  trustName: string;
  trusteeName: string;
  protectionAmount: number;
  distributionSchedule: string;
  taxProtection: boolean;
  generationalProtection: boolean;
}

export class RockefellerPremiumService {
  private readonly REFERENCE_NUMBER = '123456789';
  private readonly ROCKEFELLER_MULTIPLIER = 1.23456789;
  private readonly FAMILY_PROTECTION_ENHANCEMENT = 1.156789;

  // Calculate premium for $40M family protection plan
  calculateFamilyProtectionPremium(
    age: number,
    healthRating: string = 'PREFERRED',
    paymentFrequency: string = 'MONTHLY'
  ): FamilyProtectionPlan {
    const policyHolderBenefit = 20000000;  // $20M for policy holder
    const familyBenefit = 20000000;        // $20M for family
    const totalCoverage = 40000000;         // $40M total coverage

    // Calculate base premium for policy holder portion
    const policyHolderPremium = this.calculateBasePremium(
      policyHolderBenefit,
      age,
      healthRating,
      paymentFrequency
    );

    // Calculate discounted premium for family portion
    const familyPremium = this.calculateBasePremium(
      familyBenefit,
      age,
      healthRating,
      paymentFrequency
    ) * 0.85; // 15% family discount

    // Combine premiums with Rockefeller enhancement
    const totalMonthlyPremium = (policyHolderPremium.monthlyPremium + familyPremium.monthlyPremium) * this.ROCKEFELLER_MULTIPLIER;
    const totalAnnualPremium = totalMonthlyPremium * 12;

    // Calculate cash value projections
    const cashValueProjection = this.calculateCashValueProjection(
      totalCoverage,
      totalAnnualPremium,
      age
    );

    // Calculate enhanced death benefit
    const enhancedDeathBenefit = totalCoverage * this.ROCKEFELLER_MULTIPLIER * this.FAMILY_PROTECTION_ENHANCEMENT;

    return {
      policyHolderBenefit,
      familyBenefit,
      totalCoverage,
      premiumStructure: {
        coverageAmount: totalCoverage,
        monthlyPremium: totalMonthlyPremium,
        annualPremium: totalAnnualPremium,
        cashValueProjection,
        deathBenefit: enhancedDeathBenefit,
        rockefellerEnhancement: this.ROCKEFELLER_MULTIPLIER
      },
      beneficiaries: this.createBeneficiaryStructure(),
      trustProtection: this.createTrustProtection()
    };
  }

  private calculateBasePremium(
    coverageAmount: number,
    age: number,
    healthRating: string,
    paymentFrequency: string
  ): PremiumCalculation {
    // Base rate calculation
    const baseRate = 0.008; // 0.8% base rate for high-value policies
    const ageFactor = (age / 100) + 0.3;
    
    // Health rating factors
    const healthFactors = {
      'PREFERRED_PLUS': 0.7,
      'PREFERRED': 0.8,
      'STANDARD': 1.0,
      'SUBSTANDARD': 1.4,
      'TABLED': 2.0
    };

    const healthFactor = healthFactors[healthRating as keyof typeof healthFactors] || 1.0;

    // Calculate annual premium
    const annualPremium = coverageAmount * baseRate * ageFactor * healthFactor;
    
    // Convert to payment frequency
    const frequencyMultipliers = {
      'MONTHLY': 12,
      'QUARTERLY': 4,
      'ANNUALLY': 1
    };

    const monthlyPremium = annualPremium / (frequencyMultipliers[paymentFrequency as keyof typeof frequencyMultipliers] || 12);

    // Calculate cash value projection (simplified 20-year projection)
    const cashValueProjection = this.calculateCashValueProjection(coverageAmount, annualPremium, age);

    return {
      coverageAmount,
      monthlyPremium,
      annualPremium,
      cashValueProjection,
      deathBenefit: coverageAmount,
      rockefellerEnhancement: this.ROCKEFELLER_MULTIPLIER
    };
  }

  private calculateCashValueProjection(
    coverageAmount: number,
    annualPremium: number,
    currentAge: number
  ): number[] {
    const projections: number[] = [];
    let cashValue = 0;
    const guaranteedRate = 0.04; // 4% guaranteed
    const rockefellerEnhancement = 0.07; // 7% Rockefeller enhancement

    for (let year = 0; year <= 20; year++) {
      // Calculate growth
      const growthRate = guaranteedRate + rockefellerEnhancement;
      const growth = cashValue * growthRate;
      
      // Add premium contribution (95% goes to cash value)
      const premiumContribution = annualPremium * 0.95;
      
      // Update cash value
      cashValue = cashValue + growth + premiumContribution;
      
      projections.push(Math.round(cashValue));
    }

    return projections;
  }

  private createBeneficiaryStructure(): BeneficiaryStructure[] {
    return [
      {
        name: "Primary Family Trust",
        relationship: "Trust",
        allocationAmount: 20000000,
        percentage: 50,
        isContingent: false,
        protectionType: "trust"
      },
      {
        name: "Family Protection Trust",
        relationship: "Trust",
        allocationAmount: 20000000,
        percentage: 50,
        isContingent: false,
        protectionType: "trust"
      }
    ];
  }

  private createTrustProtection(): TrustProtection {
    return {
      trustName: "Rockefeller Family Protection Trust 123456789",
      trusteeName: "Rockefeller Trust Services",
      protectionAmount: 40000000,
      distributionSchedule: "Immediate + Installment Options",
      taxProtection: true,
      generationalProtection: true
    };
  }

  // Generate policy illustration for $40M family plan
  generateFamilyProtectionIllustration(
    age: number,
    healthRating: string = 'PREFERRED'
  ): any {
    const plan = this.calculateFamilyProtectionPremium(age, healthRating);

    return {
      referenceNumber: this.REFERENCE_NUMBER,
      policyType: "ROCKEFELLER_FAMILY_PROTECTION",
      coverageBreakdown: {
        policyHolderBenefit: plan.policyHolderBenefit,
        familyBenefit: plan.familyBenefit,
        totalCoverage: plan.totalCoverage
      },
      premiumStructure: {
        monthlyPremium: plan.premiumStructure.monthlyPremium,
        annualPremium: plan.premiumStructure.annualPremium,
        paymentFrequency: "MONTHLY"
      },
      projections: {
        cashValueGrowth: plan.premiumStructure.cashValueProjection,
        deathBenefitGrowth: this.calculateDeathBenefitProjection(plan.totalCoverage, age),
        totalValueProjection: this.calculateTotalValueProjection(plan)
      },
      protectionFeatures: {
        rockefellerEnhancement: plan.premiumStructure.rockefellerEnhancement,
        familyProtectionEnhancement: this.FAMILY_PROTECTION_ENHANCEMENT,
        taxProtection: "100% Tax-Free Death Benefit",
        trustProtection: "Multi-Generational Trust Structure"
      },
      beneficiaries: plan.beneficiaries,
      trustProtection: plan.trustProtection
    };
  }

  private calculateDeathBenefitProjection(coverageAmount: number, currentAge: number): number[] {
    const projections: number[] = [];
    const baseBenefit = coverageAmount;
    const growthRate = 0.03; // 3% death benefit growth

    for (let year = 0; year <= 20; year++) {
      const enhancedBenefit = baseBenefit * Math.pow(1 + growthRate, year) * this.ROCKEFELLER_MULTIPLIER;
      projections.push(Math.round(enhancedBenefit));
    }

    return projections;
  }

  private calculateTotalValueProjection(plan: FamilyProtectionPlan): number[] {
    const cashValue = plan.premiumStructure.cashValueProjection;
    const deathBenefit = this.calculateDeathBenefitProjection(plan.totalCoverage, 45); // Assuming age 45
    
    return cashValue.map((cv, index) => cv + (deathBenefit[index] || 0));
  }

  // Calculate policy loan options for $40M plan
  calculatePolicyLoanOptions(cashValue: number): any {
    const maxLoanAmount = cashValue * 0.9; // 90% of cash value
    const rockefellerDiscount = 0.05; // 5% discount on interest

    return {
      maxLoanAmount,
      loanOptions: [
        {
          amount: maxLoanAmount * 0.5,
          interestRate: 5.5 - (5.5 * rockefellerDiscount),
          monthlyPayment: this.calculateLoanPayment(maxLoanAmount * 0.5, 5.5 - (5.5 * rockefellerDiscount)),
          term: "10 Years"
        },
        {
          amount: maxLoanAmount * 0.75,
          interestRate: 5.5 - (5.5 * rockefellerDiscount),
          monthlyPayment: this.calculateLoanPayment(maxLoanAmount * 0.75, 5.5 - (5.5 * rockefellerDiscount)),
          term: "15 Years"
        },
        {
          amount: maxLoanAmount,
          interestRate: 5.5 - (5.5 * rockefellerDiscount),
          monthlyPayment: this.calculateLoanPayment(maxLoanAmount, 5.5 - (5.5 * rockefellerDiscount)),
          term: "20 Years"
        }
      ]
    };
  }

  private calculateLoanPayment(loanAmount: number, interestRate: number): number {
    const monthlyRate = interestRate / 100 / 12;
    const term = 120; // 10 years
    
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
           (Math.pow(1 + monthlyRate, term) - 1);
  }

  // Calculate surrender value for $40M plan
  calculateSurrenderValue(
    cashValue: number,
    yearsInForce: number,
    totalPremiumsPaid: number
  ): any {
    let surrenderChargeRate = 0.1; // 10% base charge
    
    // Reduce surrender charge over time
    if (yearsInForce >= 20) surrenderChargeRate = 0;
    else if (yearsInForce >= 15) surrenderChargeRate = 0.02;
    else if (yearsInForce >= 10) surrenderChargeRate = 0.05;
    else if (yearsInForce >= 5) surrenderChargeRate = 0.08;

    const surrenderCharge = cashValue * surrenderChargeRate;
    const baseSurrenderValue = cashValue - surrenderCharge;
    
    // Rockefeller loyalty bonus
    const loyaltyBonus = totalPremiumsPaid > 1000000 ? cashValue * 0.05 : 0;

    return {
      cashValue,
      surrenderCharge,
      surrenderChargeRate,
      baseSurrenderValue,
      loyaltyBonus,
      netSurrenderValue: baseSurrenderValue + loyaltyBonus
    };
  }
}
