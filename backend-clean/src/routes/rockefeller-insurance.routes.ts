import express from 'express';
import { PrismaClient } from '@prisma/client';
import { generatePolicyNumber, calculatePremium, calculateCashValue } from '../services/rockefeller-insurance.service';
import { 
  internalAuth, 
  adminOnly, 
  underwritingAccess, 
  claimsAccess, 
  trustAccess, 
  readonlyAccess,
  internalRateLimit,
  internalAuditLog,
  validateServiceRegistration
} from '../middleware/internal-auth.middleware';

const router = express.Router();
const prisma = new PrismaClient();

// Reference number for all Rockefeller policies
const REFERENCE_NUMBER = '123456789';

// Apply internal authentication and audit logging to all routes
router.use(validateServiceRegistration);
router.use(internalAuditLog);
router.use(internalRateLimit(500, 3600000)); // 500 requests per hour

// Create a new Rockefeller policy holder (Underwriting access required)
router.post('/policyholders', underwritingAccess, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      socialSecurityNumber,
      occupation,
      annualIncome
    } = req.body;

    const policyHolder = await prisma.rockefellerPolicyHolder.create({
      data: {
        referenceNumber: REFERENCE_NUMBER,
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        address,
        city,
        state,
        zipCode,
        socialSecurityNumber,
        occupation,
        annualIncome
      }
    });

    res.status(201).json({
      success: true,
      data: policyHolder,
      message: 'Rockefeller policy holder created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating policy holder',
      error: error.message
    });
  }
});

// Create a new whole life insurance policy (Underwriting access required)
router.post('/policies', underwritingAccess, async (req, res) => {
  try {
    const {
      policyHolderId,
      coverageAmount,
      paymentFrequency,
      issueDate,
      maturityDate,
      beneficiaries
    } = req.body;

    const premiumAmount = calculatePremium(coverageAmount, paymentFrequency);
    const policyNumber = generatePolicyNumber();

    const policy = await prisma.wholeLifePolicy.create({
      data: {
        policyNumber,
        policyHolderId,
        referenceNumber: REFERENCE_NUMBER,
        policyType: 'WHOLE_LIFE',
        coverageAmount,
        premiumAmount,
        paymentFrequency,
        issueDate: new Date(issueDate),
        maturityDate: new Date(maturityDate),
        beneficiaries: {
          create: beneficiaries.map((ben: any) => ({
            ...ben,
            referenceNumber: REFERENCE_NUMBER
          }))
        }
      },
      include: {
        beneficiaries: true,
        policyHolder: true
      }
    });

    res.status(201).json({
      success: true,
      data: policy,
      message: 'Rockefeller whole life policy created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating policy',
      error: error.message
    });
  }
});

// Get all policies for a policy holder (Readonly access required)
router.get('/policyholders/:policyHolderId/policies', readonlyAccess, async (req, res) => {
  try {
    const { policyHolderId } = req.params;
    
    const policies = await prisma.wholeLifePolicy.findMany({
      where: {
        policyHolderId,
        referenceNumber: REFERENCE_NUMBER
      },
      include: {
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
      message: 'Error fetching policies',
      error: error.message
    });
  }
});

// Process premium payment (Admin access required)
router.post('/policies/:policyId/premiums', adminOnly, async (req, res) => {
  try {
    const { policyId } = req.params;
    const { amount, paymentMethod, dueDate } = req.body;

    const payment = await prisma.premiumPayment.create({
      data: {
        policyId,
        amount,
        paymentMethod,
        paymentDate: new Date(),
        dueDate: new Date(dueDate),
        paymentStatus: 'PAID',
        referenceNumber: REFERENCE_NUMBER
      }
    });

    // Update policy cash value
    const policy = await prisma.wholeLifePolicy.findUnique({
      where: { id: policyId }
    });

    if (policy) {
      const newCashValue = calculateCashValue(
        policy.cashValue,
        amount,
        policy.issueDate
      );

      await prisma.wholeLifePolicy.update({
        where: { id: policyId },
        data: { cashValue: newCashValue }
      });
    }

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Premium payment processed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing premium payment',
      error: error.message
    });
  }
});

// File a claim (Claims access required)
router.post('/policies/:policyId/claims', claimsAccess, async (req, res) => {
  try {
    const { policyId } = req.params;
    const {
      claimType,
      claimAmount,
      description,
      supportingDocs
    } = req.body;

    const claimNumber = `CLM-${REFERENCE_NUMBER}-${Date.now()}`;

    const claim = await prisma.claim.create({
      data: {
        policyId,
        claimNumber,
        claimType,
        claimAmount,
        claimDate: new Date(),
        description,
        supportingDocs,
        claimStatus: 'PENDING',
        referenceNumber: REFERENCE_NUMBER
      }
    });

    res.status(201).json({
      success: true,
      data: claim,
      message: 'Claim filed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error filing claim',
      error: error.message
    });
  }
});

// Add policy rider (Underwriting access required)
router.post('/policies/:policyId/riders', underwritingAccess, async (req, res) => {
  try {
    const { policyId } = req.params;
    const {
      riderType,
      riderName,
      coverageAmount,
      additionalPremium,
      effectiveDate,
      expirationDate
    } = req.body;

    const rider = await prisma.policyRider.create({
      data: {
        policyId,
        riderType,
        riderName,
        coverageAmount,
        additionalPremium,
        effectiveDate: new Date(effectiveDate),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        referenceNumber: REFERENCE_NUMBER
      }
    });

    res.status(201).json({
      success: true,
      data: rider,
      message: 'Policy rider added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding policy rider',
      error: error.message
    });
  }
});

// Get policy details with full information (Readonly access required)
router.get('/policies/:policyId', readonlyAccess, async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: policy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching policy details',
      error: error.message
    });
  }
});

// Create Rockefeller Family Trust (Trust access required)
router.post('/trusts', trustAccess, async (req, res) => {
  try {
    const {
      trustName,
      trusteeName,
      trusteeContact,
      grantorName,
      grantorContact,
      trustValue,
      establishedDate,
      terminationDate,
      policies
    } = req.body;

    const trust = await prisma.rockefellerFamilyTrust.create({
      data: {
        trustName,
        trustType: 'FAMILY_TRUST',
        referenceNumber: REFERENCE_NUMBER,
        trusteeName,
        trusteeContact,
        grantorName,
        grantorContact,
        trustValue,
        establishedDate: new Date(establishedDate),
        terminationDate: terminationDate ? new Date(terminationDate) : null,
        policies
      }
    });

    res.status(201).json({
      success: true,
      data: trust,
      message: 'Rockefeller Family Trust created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating trust',
      error: error.message
    });
  }
});

// Get all Rockefeller policies (Admin only endpoint)
router.get('/policies', adminOnly, async (req, res) => {
  try {
    const policies = await prisma.wholeLifePolicy.findMany({
      where: {
        referenceNumber: REFERENCE_NUMBER
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
      message: 'Error fetching policies',
      error: error.message
    });
  }
});

export default router;
