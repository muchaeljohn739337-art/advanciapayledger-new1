// HELOC Service for Rockefeller Home Protection Plan Integration
// Reference Number: 123456789-HELOC

import { PrismaClient } from '@prisma/client';
import { 
  HELOCApplication, 
  HELOCAccount, 
  HELOCDraw, 
  HELOCRepayment,
  HELOCRiskAssessment,
  HELOCControls,
  HELOCNotification,
  HELOCSettings,
  HELOCStatus,
  DrawPurpose,
  DrawStatus,
  RepaymentType,
  PaymentMethod,
  NotificationType,
  HELOCCalculator
} from '../models/HELOC';

const prisma = new PrismaClient();

export class HELOCService {
  private static readonly SETTINGS: HELOCSettings = {
    id: 'default-settings',
    baseInterestRate: 7.5, // Prime + 0.5%
    preferredRate: 7.0, // Preferred rate for trusted families
    maxRate: 15.0,
    maxLTV: 80,
    preferredMaxLTV: 85, // For trusted families
    setupFee: 0, // Waived for protection plan members
    annualFee: 0, // Waived for protection plan members
    drawPeriodYears: 15, // Extended from standard 10
    repaymentPeriodYears: 25, // Extended from standard 20
    emergencyDrawLimit: 25000,
    counselingThreshold: 50000,
    monthlyDrawLimit: 0.1, // 10% of credit limit
    minCreditScore: 680,
    maxDebtToIncome: 0.43,
    maxLoanToValue: 85.0,
    trustProtectionEnabled: true,
    trustPaymentThreshold: 0.05, // 5% of monthly payment
    active: true,
    version: '1.0'
  };

  // Application Management
  static async createApplication(
    protectionPlanId: string,
    homeValue: number,
    requestedAmount: number
  ): Promise<HELOCApplication> {
    const referenceNumber = `123456789-HELOC-${Date.now()}`;
    
    const application: HELOCApplication = {
      id: `app_${Date.now()}`,
      referenceNumber,
      protectionPlanId,
      userId: '', // Will be populated from protection plan
      homeValue,
      requestedAmount,
      maxLTV: this.SETTINGS.preferredMaxLTV,
      interestRate: this.SETTINGS.baseInterestRate,
      status: HELOCStatus.PENDING,
      submittedAt: new Date(),
      updatedAt: new Date()
    };

    // Get user ID from protection plan
    const protectionPlan = await prisma.protectionPlan.findUnique({
      where: { id: protectionPlanId },
      include: { user: true }
    });

    if (!protectionPlan) {
      throw new Error('Protection plan not found');
    }

    application.userId = protectionPlan.userId;

    // Create application in database
    const createdApplication = await prisma.hELLOCApplication.create({
      data: {
        referenceNumber: application.referenceNumber,
        protectionPlanId: application.protectionPlanId,
        userId: application.userId,
        homeValue: application.homeValue,
        requestedAmount: application.requestedAmount,
        maxLTV: application.maxLTV,
        interestRate: application.interestRate,
        status: application.status,
        submittedAt: application.submittedAt,
        updatedAt: application.updatedAt
      }
    });

    console.log('HELOC Application Created:', createdApplication);
    return { ...application, id: createdApplication.id };
  }

  static async assessRisk(applicationId: string): Promise<HELOCRiskAssessment> {
    // Mock risk assessment - in production, integrate with credit bureaus
    const assessment: HELOCRiskAssessment = {
      id: `risk_${Date.now()}`,
      applicationId,
      creditScore: 780, // Mock excellent credit
      debtToIncome: 0.25, // Mock low DTI
      loanToValue: 75, // Mock LTV
      propertyValue: 500000,
      marketRisk: 'LOW',
      borrowerRisk: 'LOW',
      overallRisk: 'LOW',
      recommendedLimit: 400000,
      recommendedRate: 7.5,
      recommendedTerms: null,
      conditions: [],
      restrictions: [],
      assessmentModel: 'ROCKEFELLER-V1',
      assessorId: null,
      assessmentDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create risk assessment in database
    const createdAssessment = await prisma.hELLOCRiskAssessment.create({
      data: {
        applicationId: assessment.applicationId,
        creditScore: assessment.creditScore,
        debtToIncome: assessment.debtToIncome,
        loanToValue: assessment.loanToValue,
        propertyValue: assessment.propertyValue,
        marketRisk: assessment.marketRisk,
        borrowerRisk: assessment.borrowerRisk,
        overallRisk: assessment.overallRisk,
        recommendedLimit: assessment.recommendedLimit,
        recommendedRate: assessment.recommendedRate,
        assessmentModel: assessment.assessmentModel,
        assessmentDate: assessment.assessmentDate
      }
    });

    console.log('Risk Assessment Completed:', createdAssessment);
    return { ...assessment, id: createdAssessment.id };
  }

  static async approveApplication(applicationId: string): Promise<HELOCApplication> {
    // Update application status in database
    const application = await prisma.hELLOCApplication.update({
      where: { id: applicationId },
      data: {
        status: HELOCStatus.APPROVED,
        approvedAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('Application Approved:', application);
    return {
      id: application.id,
      referenceNumber: application.referenceNumber,
      protectionPlanId: application.protectionPlanId,
      userId: application.userId,
      homeValue: application.homeValue,
      requestedAmount: application.requestedAmount,
      maxLTV: application.maxLTV,
      interestRate: application.interestRate,
      status: application.status as HELOCStatus,
      submittedAt: application.submittedAt,
      approvedAt: application.approvedAt,
      rejectedAt: application.rejectedAt,
      rejectionReason: application.rejectionReason,
      riskAssessment: null,
      account: null,
      protectionPlan: null,
      user: null,
      ipAddress: application.ipAddress,
      userAgent: application.userAgent,
      documents: application.documents,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };
  }

  static async activateAccount(applicationId: string): Promise<HELOCAccount> {
    const application = await prisma.hELLOCApplication.findUnique({
      where: { id: applicationId },
      include: { protectionPlan: true }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const riskAssessment = await this.assessRisk(applicationId);

    const drawPeriodEndDate = new Date();
    drawPeriodEndDate.setFullYear(drawPeriodEndDate.getFullYear() + this.SETTINGS.drawPeriodYears);

    const repaymentPeriodEndDate = new Date();
    repaymentPeriodEndDate.setFullYear(repaymentPeriodEndDate.getFullYear() + this.SETTINGS.drawPeriodYears + this.SETTINGS.repaymentPeriodYears);

    // Create account in database
    const account = await prisma.hELOCAccount.create({
      data: {
        applicationId: application.id,
        protectionPlanId: application.protectionPlanId,
        userId: application.userId,
        creditLimit: riskAssessment.recommendedLimit,
        outstandingBalance: 0,
        availableCredit: riskAssessment.recommendedLimit,
        interestRate: riskAssessment.recommendedRate,
        drawPeriodEndDate,
        repaymentPeriodEndDate,
        status: HELOCStatus.ACTIVE,
        monthlyPayment: 0,
        nextPaymentDue: new Date(),
        trustProtectionEnabled: true,
        automaticPaymentEnabled: false,
        totalDraws: 0,
        totalPayments: 0
      }
    });

    console.log('HELOC Account Activated:', account);
    return {
      id: account.id,
      applicationId: account.applicationId,
      protectionPlanId: account.protectionPlanId,
      userId: account.userId,
      creditLimit: account.creditLimit,
      outstandingBalance: account.outstandingBalance,
      availableCredit: account.availableCredit,
      interestRate: account.interestRate,
      drawPeriodEndDate: account.drawPeriodEndDate,
      repaymentPeriodEndDate: account.repaymentPeriodEndDate,
      monthlyPayment: account.monthlyPayment,
      nextPaymentDue: account.nextPaymentDue,
      lastPaymentDate: account.lastPaymentDate,
      status: account.status as HELOCStatus,
      trustProtectionEnabled: account.trustProtectionEnabled,
      automaticPaymentEnabled: account.automaticPaymentEnabled,
      lastDrawDate: account.lastDrawDate,
      totalDraws: account.totalDraws,
      totalPayments: account.totalPayments,
      application: null,
      protectionPlan: null,
      user: null,
      draws: [],
      payments: [],
      notifications: [],
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  // Draw Management
  static async requestDraw(
    accountId: string,
    amount: number,
    purpose: DrawPurpose,
    description: string
  ): Promise<HELOCDraw> {
    const account = await prisma.hELOCAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Validate draw request
    if (amount > account.availableCredit) {
      throw new Error('Insufficient available credit');
    }

    const counselingRequired = amount >= this.SETTINGS.counselingThreshold;
    
    // Create draw in database
    const draw = await prisma.hELOCDraw.create({
      data: {
        accountId,
        applicationId: account.applicationId,
        amount,
        purpose,
        description,
        status: counselingRequired ? DrawStatus.PENDING : DrawStatus.APPROVED,
        requestedAt: new Date(),
        counselingRequired,
        counselingCompleted: !counselingRequired
      }
    });

    // Auto-approve for emergency and small amounts
    if (purpose === DrawPurpose.EMERGENCY || amount <= this.SETTINGS.emergencyDrawLimit) {
      await this.processDraw(draw.id);
    }

    console.log('Draw Requested:', draw);
    return {
      id: draw.id,
      accountId: draw.accountId,
      applicationId: draw.applicationId,
      amount: draw.amount,
      purpose: draw.purpose as DrawPurpose,
      description: draw.description,
      status: draw.status as DrawStatus,
      requestedAt: draw.requestedAt,
      processedAt: draw.processedAt,
      approvedBy: draw.approvedBy,
      rejectionReason: draw.rejectionReason,
      counselingRequired: draw.counselingRequired,
      counselingCompleted: draw.counselingCompleted,
      counselingDate: draw.counselingDate,
      documents: draw.documents,
      bankTransferId: draw.bankTransferId,
      account: null,
      createdAt: draw.createdAt,
      updatedAt: draw.updatedAt
    };
  }

  static async processDraw(drawId: string): Promise<HELOCDraw> {
    const draw = await prisma.hELOCDraw.findUnique({
      where: { id: drawId },
      include: { account: true }
    });

    if (!draw || !draw.account) {
      throw new Error('Draw not found');
    }

    // Update account balance
    const newOutstandingBalance = draw.account.outstandingBalance + draw.amount;
    const newAvailableCredit = HELOCCalculator.calculateAvailableCredit(
      draw.account.creditLimit,
      newOutstandingBalance
    );

    // Update account
    await prisma.hELOCAccount.update({
      where: { id: draw.accountId },
      data: {
        outstandingBalance: newOutstandingBalance,
        availableCredit: newAvailableCredit,
        lastDrawDate: new Date(),
        totalDraws: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Calculate new monthly payment
    const monthlyPayment = HELOCCalculator.calculateMonthlyPayment(
      newOutstandingBalance,
      draw.account.interestRate,
      this.SETTINGS.repaymentPeriodYears
    );

    // Update draw status
    const updatedDraw = await prisma.hELOCDraw.update({
      where: { id: drawId },
      data: {
        status: DrawStatus.PROCESSED,
        processedAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Update account monthly payment
    await prisma.hELOCAccount.update({
      where: { id: draw.accountId },
      data: {
        monthlyPayment,
        updatedAt: new Date()
      }
    });

    // Send notification
    await this.sendNotification(
      draw.accountId,
      'DRAW_PROCESSED' as any,
      `Draw of $${draw.amount.toLocaleString()} has been processed and deposited to your account.`
    );

    console.log('Draw Processed:', updatedDraw);
    return {
      id: updatedDraw.id,
      accountId: updatedDraw.accountId,
      applicationId: updatedDraw.applicationId,
      amount: updatedDraw.amount,
      purpose: updatedDraw.purpose as DrawPurpose,
      description: updatedDraw.description,
      status: updatedDraw.status as DrawStatus,
      requestedAt: updatedDraw.requestedAt,
      processedAt: updatedDraw.processedAt,
      approvedBy: updatedDraw.approvedBy,
      rejectionReason: updatedDraw.rejectionReason,
      counselingRequired: updatedDraw.counselingRequired,
      counselingCompleted: updatedDraw.counselingCompleted,
      counselingDate: updatedDraw.counselingDate,
      documents: updatedDraw.documents,
      bankTransferId: updatedDraw.bankTransferId,
      account: null,
      createdAt: updatedDraw.createdAt,
      updatedAt: updatedDraw.updatedAt
    };
  }

  // Payment Management
  static async processPayment(
    accountId: string,
    amount: number,
    type: RepaymentType,
    method: PaymentMethod
  ): Promise<HELOCRepayment> {
    const account = await prisma.hELOCAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Create payment in database
    const payment = await prisma.hELOCRepayment.create({
      data: {
        accountId,
        amount,
        type,
        paymentDate: new Date(),
        method,
        trustCovered: method === PaymentMethod.TRUST_PAYMENT,
        processedAt: new Date()
      }
    });

    // Update account balance
    const newOutstandingBalance = account.outstandingBalance - amount;
    const newAvailableCredit = HELOCCalculator.calculateAvailableCredit(
      account.creditLimit,
      newOutstandingBalance
    );

    await prisma.hELOCAccount.update({
      where: { id: accountId },
      data: {
        outstandingBalance: newOutstandingBalance,
        availableCredit: newAvailableCredit,
        lastPaymentDate: new Date(),
        totalPayments: { increment: amount },
        updatedAt: new Date()
      }
    });

    // Recalculate monthly payment
    if (newOutstandingBalance > 0) {
      const monthlyPayment = HELOCCalculator.calculateMonthlyPayment(
        newOutstandingBalance,
        account.interestRate,
        this.SETTINGS.repaymentPeriodYears
      );

      await prisma.hELOCAccount.update({
        where: { id: accountId },
        data: {
          monthlyPayment,
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.hELOCAccount.update({
        where: { id: accountId },
        data: {
          monthlyPayment: 0,
          updatedAt: new Date()
        }
      });
    }

    console.log('Payment Processed:', payment);
    return {
      id: payment.id,
      accountId: payment.accountId,
      drawId: payment.drawId,
      amount: payment.amount,
      type: payment.type as RepaymentType,
      paymentDate: payment.paymentDate,
      method: payment.method as PaymentMethod,
      transactionId: payment.transactionId,
      trustCovered: payment.trustCovered,
      trustPaymentId: payment.trustPaymentId,
      processedAt: payment.processedAt,
      processedBy: payment.processedBy,
      account: null,
      createdAt: payment.createdAt
    };
  }

  // Trust Protection Features
  static async enableTrustProtection(accountId: string): Promise<void> {
    await prisma.hELOCAccount.update({
      where: { id: accountId },
      data: {
        trustProtectionEnabled: true,
        updatedAt: new Date()
      }
    });

    console.log('Trust Protection Enabled for account:', accountId);
  }

  static async processTrustPayment(accountId: string): Promise<HELOCRepayment> {
    const account = await prisma.hELOCAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      throw new Error('Account not found');
    }
    
    if (account.monthlyPayment > 0) {
      return await this.processPayment(
        accountId,
        account.monthlyPayment,
        RepaymentType.TRUST_COVERED,
        PaymentMethod.TRUST_PAYMENT
      );
    }
    
    throw new Error('No payment required');
  }

  // Notifications
  static async sendNotification(
    accountId: string,
    type: any,
    message: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM'
  ): Promise<HELOCNotification> {
    const notification = await prisma.hELOCNotification.create({
      data: {
        accountId,
        type,
        title: 'HELOC Notification',
        message,
        priority,
        read: false,
        createdAt: new Date()
      }
    });

    console.log('Notification Sent:', notification);
    return {
      id: notification.id,
      accountId: notification.accountId,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      priority: notification.priority as any,
      read: notification.read,
      readAt: notification.readAt,
      emailSent: notification.emailSent,
      smsSent: notification.smsSent,
      pushSent: notification.pushSent,
      actionRequired: notification.actionRequired,
      actionUrl: notification.actionUrl,
      actionBy: notification.actionBy,
      account: null,
      createdAt: notification.createdAt
    };
  }

  // Reporting and Analytics
  static async getAccountSummary(accountId: string): Promise<any> {
    const account = await prisma.hELOCAccount.findUnique({
      where: { id: accountId },
      include: {
        application: true,
        protectionPlan: true,
        user: true
      }
    });
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    return {
      accountDetails: {
        id: account.id,
        status: account.status,
        creditLimit: account.creditLimit,
        outstandingBalance: account.outstandingBalance,
        interestRate: account.interestRate
      },
      availableCredit: account.availableCredit,
      utilizationRate: (account.outstandingBalance / account.creditLimit) * 100,
      nextPaymentAmount: account.monthlyPayment,
      nextPaymentDate: account.nextPaymentDue,
      drawPeriodRemaining: Math.max(0, Math.ceil((account.drawPeriodEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
      trustProtectionEnabled: account.trustProtectionEnabled
    };
  }

  static async getPortfolioMetrics(): Promise<any> {
    // Mock portfolio metrics
    return {
      totalAccounts: 1000,
      totalCreditLimit: 300000000, // $300M
      totalOutstandingBalance: 75000000, // $75M
      averageUtilization: 25,
      delinquencyRate: 0.2, // 0.2% vs industry 2.5%
      averageCreditScore: 780,
      satisfactionRate: 98.5
    };
  }

  // Helper methods (mock implementations)
  private static async getApplication(id: string): Promise<HELOCApplication> {
    const application = await prisma.hELLOCApplication.findUnique({
      where: { id },
      include: {
        protectionPlan: true,
        user: true,
        riskAssessment: true,
        account: true
      }
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return {
      id: application.id,
      referenceNumber: application.referenceNumber,
      protectionPlanId: application.protectionPlanId,
      userId: application.userId,
      homeValue: application.homeValue,
      requestedAmount: application.requestedAmount,
      maxLTV: application.maxLTV,
      interestRate: application.interestRate,
      status: application.status as HELOCStatus,
      submittedAt: application.submittedAt,
      approvedAt: application.approvedAt,
      rejectedAt: application.rejectedAt,
      rejectionReason: application.rejectionReason,
      riskAssessment: null,
      account: null,
      protectionPlan: null,
      user: null,
      ipAddress: application.ipAddress,
      userAgent: application.userAgent,
      documents: application.documents,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };
  }

  private static async getAccount(id: string): Promise<HELOCAccount> {
    const account = await prisma.hELOCAccount.findUnique({
      where: { id },
      include: {
        application: true,
        protectionPlan: true,
        user: true,
        draws: true,
        payments: true,
        notifications: true
      }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    return {
      id: account.id,
      applicationId: account.applicationId,
      protectionPlanId: account.protectionPlanId,
      userId: account.userId,
      creditLimit: account.creditLimit,
      outstandingBalance: account.outstandingBalance,
      availableCredit: account.availableCredit,
      interestRate: account.interestRate,
      drawPeriodEndDate: account.drawPeriodEndDate,
      repaymentPeriodEndDate: account.repaymentPeriodEndDate,
      monthlyPayment: account.monthlyPayment,
      nextPaymentDue: account.nextPaymentDue,
      lastPaymentDate: account.lastPaymentDate,
      status: account.status as HELOCStatus,
      trustProtectionEnabled: account.trustProtectionEnabled,
      automaticPaymentEnabled: account.automaticPaymentEnabled,
      lastDrawDate: account.lastDrawDate,
      totalDraws: account.totalDraws,
      totalPayments: account.totalPayments,
      application: null,
      protectionPlan: null,
      user: null,
      draws: [],
      payments: [],
      notifications: [],
      createdAt: account.createdAt,
      updatedAt: account.updatedAt
    };
  }

  private static async getDraw(id: string): Promise<HELOCDraw> {
    const draw = await prisma.hELOCDraw.findUnique({
      where: { id },
      include: { account: true }
    });

    if (!draw) {
      throw new Error('Draw not found');
    }

    return {
      id: draw.id,
      accountId: draw.accountId,
      applicationId: draw.applicationId,
      amount: draw.amount,
      purpose: draw.purpose as DrawPurpose,
      description: draw.description,
      status: draw.status as DrawStatus,
      requestedAt: draw.requestedAt,
      processedAt: draw.processedAt,
      approvedBy: draw.approvedBy,
      rejectionReason: draw.rejectionReason,
      counselingRequired: draw.counselingRequired,
      counselingCompleted: draw.counselingCompleted,
      counselingDate: draw.counselingDate,
      documents: draw.documents,
      bankTransferId: draw.bankTransferId,
      account: null,
      createdAt: draw.createdAt,
      updatedAt: draw.updatedAt
    };
  }
}

export default HELOCService;
