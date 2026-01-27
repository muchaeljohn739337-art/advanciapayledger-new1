// Rockefeller Whole Life Insurance Service
// Reference Number: 123456789

export const generatePolicyNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ROC-${123456789}-${timestamp}-${random}`;
};

export const calculatePremium = (
  coverageAmount: number,
  paymentFrequency: string,
  age?: number,
  healthRating?: string
): number => {
  // Base premium calculation using Rockefeller reference number
  const baseRate = 0.01; // 1% base rate
  const frequencyMultiplier = {
    'MONTHLY': 1,
    'QUARTERLY': 3,
    'ANNUALLY': 12
  }[paymentFrequency] || 1;

  // Age factor (simplified)
  const ageFactor = age ? (age / 100) + 0.5 : 1;
  
  // Health rating factor
  const healthFactor = {
    'PREFERRED': 0.8,
    'STANDARD': 1,
    'SUBSTANDARD': 1.5,
    'TABLED': 2
  }[healthRating || 'STANDARD'] || 1;

  // Rockefeller special calculation using reference number
  const rockefellerMultiplier = 123456789 / 100000000; // 1.23456789

  const annualPremium = coverageAmount * baseRate * ageFactor * healthFactor * rockefellerMultiplier;
  
  return annualPremium / frequencyMultiplier;
};

export const calculateCashValue = (
  currentCashValue: number,
  premiumPayment: number,
  issueDate: Date,
  interestRate: number = 0.05
): number => {
  // Calculate years since policy issue
  const currentYear = new Date().getFullYear();
  const issueYear = issueDate.getFullYear();
  const yearsInForce = currentYear - issueYear;

  // Rockefeller cash value growth formula
  const rockefellerGrowthRate = 0.07; // 7% growth rate
  const guaranteedRate = Math.min(interestRate, rockefellerGrowthRate);
  
  // Compound interest calculation
  const growth = currentCashValue * guaranteedRate;
  const premiumAccumulation = premiumPayment * 0.95; // 95% of premium goes to cash value
  
  // Apply Rockefeller enhancement factor
  const enhancementFactor = 1 + (123456789 / 10000000000); // 1.0123456789
  
  return (currentCashValue + growth + premiumAccumulation) * enhancementFactor;
};

export const calculateDeathBenefit = (
  coverageAmount: number,
  cashValue: number,
  loanAmount: number = 0
): number => {
  // Rockefeller death benefit calculation
  const baseBenefit = coverageAmount;
  const cashValueBonus = cashValue * 1.1; // 110% of cash value added
  const loanDeduction = loanAmount * 1.05; // 105% of loan deducted
  
  const totalBenefit = baseBenefit + cashValueBonus - loanDeduction;
  
  // Apply Rockefeller multiplier
  const rockefellerMultiplier = 123456789 / 100000000; // 1.23456789
  
  return Math.max(totalBenefit * rockefellerMultiplier, coverageAmount);
};

export const calculatePolicyLoan = (
  cashValue: number,
  requestedAmount: number,
  interestRate: number = 5.5
): { approved: boolean; loanAmount: number; monthlyPayment: number; totalPayback: number } => {
  // Maximum loan is 90% of cash value
  const maxLoanAmount = cashValue * 0.9;
  
  if (requestedAmount > maxLoanAmount) {
    return {
      approved: false,
      loanAmount: 0,
      monthlyPayment: 0,
      totalPayback: 0
    };
  }

  // Calculate loan terms
  const loanAmount = requestedAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const loanTerm = 120; // 10 years
  
  // Rockefeller loan calculation
  const monthlyPayment = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) /
                        (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
  
  const totalPayback = monthlyPayment * loanTerm;
  
  // Apply Rockefeller discount
  const rockefellerDiscount = 0.95; // 5% discount
  const adjustedMonthlyPayment = monthlyPayment * rockefellerDiscount;
  
  return {
    approved: true,
    loanAmount,
    monthlyPayment: adjustedMonthlyPayment,
    totalPayback: adjustedMonthlyPayment * loanTerm
  };
};

export const calculateSurrenderValue = (
  cashValue: number,
  issueDate: Date,
  premiumPaymentsPaid: number,
  totalPremiumsExpected: number
): number => {
  // Calculate years in force
  const currentYear = new Date().getFullYear();
  const issueYear = issueDate.getFullYear();
  const yearsInForce = currentYear - issueYear;

  // Surrender charge schedule
  let surrenderChargeRate = 0.1; // 10% base charge
  
  if (yearsInForce >= 20) {
    surrenderChargeRate = 0; // No charge after 20 years
  } else if (yearsInForce >= 15) {
    surrenderChargeRate = 0.02; // 2% charge
  } else if (yearsInForce >= 10) {
    surrenderChargeRate = 0.05; // 5% charge
  } else if (yearsInForce >= 5) {
    surrenderChargeRate = 0.08; // 8% charge
  }

  // Calculate surrender value
  const surrenderCharge = cashValue * surrenderChargeRate;
  const baseSurrenderValue = cashValue - surrenderCharge;

  // Rockefeller enhancement for loyal policyholders
  const paymentRatio = premiumPaymentsPaid / totalPremiumsExpected;
  const rockefellerBonus = paymentRatio > 0.8 ? cashValue * 0.05 : 0; // 5% bonus for 80%+ payment ratio
  
  return baseSurrenderValue + rockefellerBonus;
};

export const generatePolicyIllustration = (
  coverageAmount: number,
  premiumAmount: number,
  paymentFrequency: string,
  issueDate: Date,
  currentAge: number,
  healthRating: string = 'STANDARD'
): any => {
  const illustration = {
    referenceNumber: '123456789',
    coverageAmount,
    premiumAmount,
    paymentFrequency,
    issueDate,
    currentAge,
    healthRating,
    projections: []
  };

  // Generate 20-year projection
  let cashValue = 0;
  let deathBenefit = coverageAmount;

  for (let year = 0; year <= 20; year++) {
    const age = currentAge + year;
    const yearDate = new Date(issueDate);
    yearDate.setFullYear(yearDate.getFullYear() + year);

    // Calculate annual premium
    const annualPremium = paymentFrequency === 'MONTHLY' ? premiumAmount * 12 :
                         paymentFrequency === 'QUARTERLY' ? premiumAmount * 4 :
                         premiumAmount;

    // Update cash value
    cashValue = calculateCashValue(cashValue, annualPremium, issueDate);

    // Update death benefit
    deathBenefit = calculateDeathBenefit(coverageAmount, cashValue);

    illustration.projections.push({
      year,
      age,
      cashValue: Math.round(cashValue * 100) / 100,
      deathBenefit: Math.round(deathBenefit * 100) / 100,
      premiumsPaid: annualPremium * (year + 1),
      totalCashValue: Math.round(cashValue * 100) / 100
    });
  }

  return illustration;
};

export const validatePolicyEligibility = (
  age: number,
  coverageAmount: number,
  annualIncome: number,
  healthRating: string = 'STANDARD'
): { eligible: boolean; reasons: string[]; recommendations: string[] } => {
  const reasons: string[] = [];
  const recommendations: string[] = [];
  let eligible = true;

  // Age requirements
  if (age < 18) {
    eligible = false;
    reasons.push('Applicant must be at least 18 years old');
  } else if (age > 85) {
    eligible = false;
    reasons.push('Applicant age exceeds maximum limit of 85 years');
  }

  // Coverage amount requirements
  const minCoverage = annualIncome * 10;
  const maxCoverage = annualIncome * 30;

  if (coverageAmount < minCoverage) {
    recommendations.push(`Consider increasing coverage to at least 10x annual income ($${minCoverage.toLocaleString()})`);
  }

  if (coverageAmount > maxCoverage) {
    eligible = false;
    reasons.push(`Coverage amount exceeds maximum of 30x annual income ($${maxCoverage.toLocaleString()})`);
  }

  // Health rating restrictions
  if (healthRating === 'TABLED' && age > 70) {
    eligible = false;
    reasons.push('Tabled ratings not available for applicants over 70');
  }

  // Rockefeller special considerations
  if (annualIncome < 50000) {
    recommendations.push('Rockefeller Premium Protection available for incomes over $50,000');
  }

  return {
    eligible,
    reasons,
    recommendations
  };
};
