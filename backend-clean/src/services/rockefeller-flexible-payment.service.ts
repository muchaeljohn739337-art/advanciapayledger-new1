// Rockefeller Flexible Payment Service
// Accommodates every-other-month payment patterns
// Reference Number: 123456789

export interface FlexiblePaymentPlan {
  policyNumber: string;
  standardPremium: number;
  flexiblePaymentAmount: number;
  paymentFrequency: 'BI_MONTHLY' | 'WHEN_PAST_DUE' | 'FLEXIBLE';
  gracePeriodDays: number;
  lateFeeStructure: LateFeeStructure;
  paymentSchedule: PaymentSchedule[];
  rockefellerFlexibility: RockefellerFlexibility;
}

export interface LateFeeStructure {
  standardLateFee: number;
  gracePeriodFee: number;
  pastDueFee: number;
  maximumLateFee: number;
  rockefellerDiscount: number;
}

export interface PaymentSchedule {
  month: number;
  dueDate: Date;
  gracePeriodEnds: Date;
  pastDueStatus: Date;
  paymentExpected: boolean;
  flexiblePayment: boolean;
}

export interface RockefellerFlexibility {
  paymentForgiveness: number;
  gracePeriodExtension: number;
  lateFeeWaiver: number;
  paymentHolidays: number;
  familyProtectionOverride: boolean;
}

export class RockefellerFlexiblePaymentService {
  private readonly REFERENCE_NUMBER = '123456789';
  private readonly ROCKEFELLER_FLEXIBILITY_MULTIPLIER = 1.156789;

  // Create flexible payment plan for every-other-month payers
  createFlexiblePaymentPlan(
    policyNumber: string,
    standardPremium: number,
    paymentStyle: 'every-other-month' | 'when-past-due' | 'flexible'
  ): FlexiblePaymentPlan {
    
    const flexiblePaymentAmount = this.calculateFlexiblePayment(standardPremium, paymentStyle);
    const lateFeeStructure = this.createFlexibleLateFeeStructure(standardPremium);
    const paymentSchedule = this.generateFlexiblePaymentSchedule(standardPremium, paymentStyle);
    const rockefellerFlexibility = this.createRockefellerFlexibility();

    return {
      policyNumber,
      standardPremium,
      flexiblePaymentAmount,
      paymentFrequency: this.mapPaymentFrequency(paymentStyle),
      gracePeriodDays: 30,
      lateFeeStructure,
      paymentSchedule,
      rockefellerFlexibility
    };
  }

  private calculateFlexiblePayment(standardPremium: number, paymentStyle: string): number {
    switch (paymentStyle) {
      case 'every-other-month':
        return standardPremium * 2; // Pay double every other month
      case 'when-past-due':
        return standardPremium * 1.1; // Pay 10% extra when past due
      case 'flexible':
        return standardPremium * 1.05; // 5% flexibility premium
      default:
        return standardPremium;
    }
  }

  private mapPaymentFrequency(paymentStyle: string): 'BI_MONTHLY' | 'WHEN_PAST_DUE' | 'FLEXIBLE' {
    switch (paymentStyle) {
      case 'every-other-month':
        return 'BI_MONTHLY';
      case 'when-past-due':
        return 'WHEN_PAST_DUE';
      case 'flexible':
        return 'FLEXIBLE';
      default:
        return 'FLEXIBLE';
    }
  }

  private createFlexibleLateFeeStructure(standardPremium: number): LateFeeStructure {
    return {
      standardLateFee: standardPremium * 0.05, // 5% standard late fee
      gracePeriodFee: standardPremium * 0.02, // 2% during grace period
      pastDueFee: standardPremium * 0.08, // 8% when past due
      maximumLateFee: standardPremium * 0.15, // 15% maximum
      rockefellerDiscount: 0.5 // 50% Rockefeller discount on late fees
    };
  }

  private generateFlexiblePaymentSchedule(standardPremium: number, paymentStyle: string): PaymentSchedule[] {
    const schedule: PaymentSchedule[] = [];
    const currentDate = new Date();
    
    for (let month = 1; month <= 12; month++) {
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + month, 1);
      const gracePeriodEnds = new Date(dueDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const pastDueStatus = new Date(gracePeriodEnds.getTime() + (15 * 24 * 60 * 60 * 1000));
      
      let paymentExpected = true;
      let flexiblePayment = false;
      
      if (paymentStyle === 'every-other-month') {
        paymentExpected = month % 2 === 0; // Pay every other month
        flexiblePayment = true;
      } else if (paymentStyle === 'when-past-due') {
        paymentExpected = false; // Only pay when past due
        flexiblePayment = true;
      }
      
      schedule.push({
        month,
        dueDate,
        gracePeriodEnds,
        pastDueStatus,
        paymentExpected,
        flexiblePayment
      });
    }
    
    return schedule;
  }

  private createRockefellerFlexibility(): RockefellerFlexibility {
    return {
      paymentForgiveness: 2, // 2 payments forgiven per year
      gracePeriodExtension: 15, // 15 extra days grace period
      lateFeeWaiver: 3, // 3 late fee waivers per year
      paymentHolidays: 2, // 2 payment holidays per year
      familyProtectionOverride: true // Family protection never lapses
    };
  }

  // Calculate payment schedule for every-other-month payer
  calculateEveryOtherMonthSchedule(
    standardPremium: number,
    startDate: Date
  ): any {
    
    const payments = [];
    const doublePayment = standardPremium * 2;
    
    for (let month = 0; month < 12; month += 2) {
      const paymentDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      
      payments.push({
        month: month + 1,
        paymentDate,
        amount: doublePayment,
        coversMonths: [month + 1, month + 2],
        paymentType: 'BI_MONTHLY',
        rockefellerEnhancement: true
      });
    }
    
    return {
      referenceNumber: this.REFERENCE_NUMBER,
      paymentStyle: 'Every Other Month',
      totalAnnualPremium: standardPremium * 12,
      totalPayments: 6,
      paymentAmount: doublePayment,
      totalPaid: doublePayment * 6,
      savings: {
        lateFeeWaivers: 6,
        rockefellerDiscount: 0.5,
        totalSavings: standardPremium * 0.3 // 30% total savings
      },
      familyProtection: {
        alwaysActive: true,
        noLapseProtection: true,
        gracePeriodEnhanced: true
      }
    };
  }

  // Calculate payment schedule for "when past due" payer
  calculateWhenPastDueSchedule(
    standardPremium: number,
    startDate: Date
  ): any {
    
    const payments = [];
    const pastDuePayment = standardPremium * 1.1; // 10% extra when past due
    
    for (let month = 1; month <= 12; month++) {
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      const gracePeriodEnds = new Date(dueDate.getTime() + (30 * 24 * 60 * 60 * 1000));
      const pastDueDate = new Date(gracePeriodEnds.getTime() + (15 * 24 * 60 * 60 * 1000));
      
      payments.push({
        month,
        dueDate,
        gracePeriodEnds,
        pastDueDate,
        standardAmount: standardPremium,
        pastDueAmount: pastDuePayment,
        paymentStyle: 'WHEN_PAST_DUE',
        rockefellerProtection: true
      });
    }
    
    return {
      referenceNumber: this.REFERENCE_NUMBER,
      paymentStyle: 'When Past Due (Red Status)',
      standardPremium: standardPremium,
      pastDuePremium: pastDuePayment,
      paymentFrequency: 'When Bill Shows Past Due',
      rockefellerFlexibility: {
        noPolicyLapse: true,
        familyProtectionActive: true,
        reducedLateFees: true,
        paymentForgiveness: true
      },
      annualProjections: {
        standardAnnual: standardPremium * 12,
        pastDueAnnual: pastDuePayment * 12,
        rockefellerSavings: standardPremium * 12 * 0.2 // 20% Rockefeller savings
      }
    };
  }

  // Generate flexible payment illustration
  generateFlexiblePaymentIllustration(
    standardPremium: number,
    paymentStyle: 'every-other-month' | 'when-past-due' | 'flexible',
    policyValue: number
  ): any {
    
    const flexiblePlan = this.createFlexiblePaymentPlan('POLICY-123456789', standardPremium, paymentStyle);
    
    return {
      referenceNumber: this.REFERENCE_NUMBER,
      policyNumber: 'POLICY-123456789',
      paymentStyle: paymentStyle,
      standardPremium: standardPremium,
      flexiblePremium: flexiblePlan.flexiblePaymentAmount,
      paymentFrequency: flexiblePlan.paymentFrequency,
      rockefellerFlexibility: {
        familyProtectionGuarantee: 'Never lapses regardless of payment timing',
        lateFeeReduction: '50% Rockefeller discount on all late fees',
        gracePeriodEnhancement: '45 days instead of 30',
        paymentForgiveness: '2 missed payments forgiven per year',
        paymentHolidays: 'Skip 2 payments per year without penalty'
      },
      paymentSchedule: flexiblePlan.paymentSchedule.map(schedule => ({
        month: schedule.month,
        paymentExpected: schedule.paymentExpected,
        flexiblePayment: schedule.flexiblePayment,
        dueDate: schedule.dueDate,
        gracePeriod: schedule.gracePeriodEnds,
        pastDueDate: schedule.pastDueStatus,
        rockefellerProtection: 'Family protection always active'
      })),
      benefitsComparison: {
        standardPayment: {
          monthlyPayment: standardPremium,
          annualTotal: standardPremium * 12,
          lateFees: 'Standard rates apply',
          riskLevel: 'Policy may lapse'
        },
        flexiblePayment: {
          monthlyPayment: flexiblePlan.flexiblePaymentAmount,
          annualTotal: flexiblePlan.flexiblePaymentAmount * (paymentStyle === 'every-other-month' ? 6 : 12),
          lateFees: '50% Rockefeller discount',
          riskLevel: 'No lapse risk - Family protected'
        }
      },
      rockefellerGuarantee: {
        familyProtection: 'ALWAYS ACTIVE',
        deathBenefit: 'Never reduced due to payment timing',
        cashValue: 'Continues to grow',
        loanAccess: 'Always available',
        taxProtection: '100% tax-free benefits'
      }
    };
  }

  // Calculate payment forgiveness options
  calculatePaymentForgiveness(
    missedPayments: number,
    standardPremium: number,
    paymentStyle: string
  ): any {
    
    const rockefellerForgiveness = this.createRockefellerFlexibility();
    const forgivenPayments = Math.min(missedPayments, rockefellerForgiveness.paymentForgiveness);
    const remainingPayments = missedPayments - forgivenPayments;
    
    const totalAmountForgiven = forgivenPayments * standardPremium;
    const remainingAmountDue = remainingPayments * standardPremium;
    
    return {
      referenceNumber: this.REFERENCE_NUMBER,
      missedPayments: missedPayments,
      forgivenPayments: forgivenPayments,
      remainingPayments: remainingPayments,
      totalAmountForgiven: totalAmountForgiven,
      remainingAmountDue: remainingAmountDue,
      rockefellerBenefits: {
        paymentForgivenessUsed: forgivenPayments,
        paymentForgivenessRemaining: rockefellerForgiveness.paymentForgiveness - forgivenPayments,
        familyProtectionStatus: 'ACTIVE - NO IMPACT',
        policyStatus: 'ACTIVE - FLEXIBLE',
        creditImpact: 'NONE - Rockefeller protection'
      },
      nextSteps: {
        immediateAction: 'No action required',
        futurePayments: 'Continue flexible payment schedule',
        familyProtection: 'Continues without interruption',
        rockefellerSupport: 'Automatic forgiveness applied'
      }
    };
  }

  // Create payment holiday options
  createPaymentHoliday(
    standardPremium: number,
    holidayMonths: number
  ): any {
    
    const rockefellerFlexibility = this.createRockefellerFlexibility();
    const allowedHolidays = Math.min(holidayMonths, rockefellerFlexibility.paymentHolidays);
    const totalHolidayAmount = standardPremium * allowedHolidays;
    
    return {
      referenceNumber: this.REFERENCE_NUMBER,
      requestedHolidayMonths: holidayMonths,
      approvedHolidayMonths: allowedHolidays,
      totalHolidayAmount: totalHolidayAmount,
      rockefellerCoverage: {
        familyProtection: 'FULLY ACTIVE during holiday',
        deathBenefit: 'NO REDUCTION',
        cashValue: 'CONTINUES GROWING',
        loanAccess: 'AVAILABLE',
        taxProtection: 'MAINTAINED'
      },
      holidaySchedule: Array.from({ length: allowedHolidays }, (_, i) => ({
        holidayMonth: i + 1,
        amountForgiven: standardPremium,
        protectionStatus: 'FULLY ACTIVE',
        rockefellerGuarantee: 'No impact on benefits'
      })),
      resumePayments: {
        normalScheduleResumes: allowedHolidays + 1,
        noCatchUpRequired: true,
        rockefellerFlexibility: 'No penalties or fees'
      }
    };
  }
}
