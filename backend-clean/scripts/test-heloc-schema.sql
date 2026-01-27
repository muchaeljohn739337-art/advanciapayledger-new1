-- HELOC Schema Test Script
-- Reference Number: 123456789-HELOC
-- This script tests the HELOC database schema

-- Test Protection Plan Creation
INSERT INTO "ProtectionPlan" (
  id,
  "userId",
  "referenceNumber",
  "planType",
  "status",
  "homeValue",
  "monthlyExpenses",
  "deathBenefit",
  "monthlyPremium",
  "coverageYears",
  "trustName",
  "trustEstablished",
  "helocEnabled",
  "helocMaxLTV",
  "helocPreferredRate",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-protection-plan-1',
  'test-user-1',
  '123456789-PLAN-1',
  'STANDARD',
  'ACTIVE',
  500000.00,
  2500.00,
  1000000.00,
  1500.00,
  50,
  'Rockefeller Family Trust',
  NOW(),
  true,
  85.0,
  7.0,
  NOW(),
  NOW()
);

-- Test HELOC Application Creation
INSERT INTO "HELOCApplication" (
  id,
  "referenceNumber",
  "protectionPlanId",
  "userId",
  "homeValue",
  "requestedAmount",
  "maxLTV",
  "interestRate",
  "status",
  "submittedAt",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-heloc-app-1',
  '123456789-HELOC-1',
  'test-protection-plan-1',
  'test-user-1',
  500000.00,
  300000.00,
  85.0,
  7.5,
  'PENDING',
  NOW(),
  NOW(),
  NOW()
);

-- Test HELOC Risk Assessment Creation
INSERT INTO "HELOCRiskAssessment" (
  id,
  "applicationId",
  "creditScore",
  "debtToIncome",
  "loanToValue",
  "propertyValue",
  "marketRisk",
  "borrowerRisk",
  "overallRisk",
  "recommendedLimit",
  "recommendedRate",
  "assessmentModel",
  "assessmentDate",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-risk-assessment-1',
  'test-heloc-app-1',
  780,
  0.25,
  75.0,
  500000.00,
  'LOW',
  'LOW',
  'LOW',
  400000.00,
  7.5,
  'ROCKEFELLER-V1',
  NOW(),
  NOW(),
  NOW()
);

-- Test HELOC Account Creation
INSERT INTO "HELOCAccount" (
  id,
  "applicationId",
  "protectionPlanId",
  "userId",
  "creditLimit",
  "outstandingBalance",
  "availableCredit",
  "interestRate",
  "drawPeriodEndDate",
  "repaymentPeriodEndDate",
  "status",
  "monthlyPayment",
  "nextPaymentDue",
  "trustProtectionEnabled",
  "automaticPaymentEnabled",
  "totalDraws",
  "totalPayments",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-heloc-account-1',
  'test-heloc-app-1',
  'test-protection-plan-1',
  'test-user-1',
  400000.00,
  0.00,
  400000.00,
  7.5,
  NOW() + INTERVAL '15 years',
  NOW() + INTERVAL '40 years',
  'ACTIVE',
  0.00,
  NOW() + INTERVAL '1 month',
  true,
  false,
  0,
  0,
  NOW(),
  NOW()
);

-- Test HELOC Draw Creation
INSERT INTO "HELOCDraw" (
  id,
  "accountId",
  "applicationId",
  "amount",
  "purpose",
  "description",
  "status",
  "requestedAt",
  "counselingRequired",
  "counselingCompleted",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-heloc-draw-1',
  'test-heloc-account-1',
  'test-heloc-app-1',
  25000.00,
  'EMERGENCY',
  'Emergency medical expenses',
  'APPROVED',
  NOW(),
  false,
  true,
  NOW(),
  NOW()
);

-- Test HELOC Repayment Creation
INSERT INTO "HELOCRepayment" (
  id,
  "accountId",
  "amount",
  "type",
  "paymentDate",
  "method",
  "trustCovered",
  "processedAt",
  "createdAt"
) VALUES (
  'test-heloc-payment-1',
  'test-heloc-account-1',
  500.00,
  'REGULAR',
  NOW(),
  'BANK_TRANSFER',
  false,
  NOW(),
  NOW()
);

-- Test HELOC Notification Creation
INSERT INTO "HELOCNotification" (
  id,
  "accountId",
  "type",
  "title",
  "message",
  "priority",
  "read",
  "createdAt"
) VALUES (
  'test-heloc-notification-1',
  'test-heloc-account-1',
  'DRAW_APPROVED',
  'HELOC Draw Approved',
  'Your draw request for $25,000.00 has been approved.',
  'MEDIUM',
  false,
  NOW()
);

-- Query to verify all data was inserted correctly
SELECT 
  'Protection Plans' as table_name, COUNT(*) as count
FROM "ProtectionPlan"
WHERE "referenceNumber" LIKE '123456789-%'

UNION ALL

SELECT 
  'HELOC Applications' as table_name, COUNT(*) as count
FROM "HELOCApplication"
WHERE "referenceNumber" LIKE '123456789-%'

UNION ALL

SELECT 
  'HELOC Risk Assessments' as table_name, COUNT(*) as count
FROM "HELOCRiskAssessment"
WHERE "applicationId" LIKE 'test-heloc-app-%'

UNION ALL

SELECT 
  'HELOC Accounts' as table_name, COUNT(*) as count
FROM "HELOCAccount"
WHERE "id" LIKE 'test-heloc-account-%'

UNION ALL

SELECT 
  'HELOC Draws' as table_name, COUNT(*) as count
FROM "HELOCDraw"
WHERE "id" LIKE 'test-heloc-draw-%'

UNION ALL

SELECT 
  'HELOC Repayments' as table_name, COUNT(*) as count
FROM "HELOCRepayment"
WHERE "id" LIKE 'test-heloc-payment-%'

UNION ALL

SELECT 
  'HELOC Notifications' as table_name, COUNT(*) as count
FROM "HELOCNotification"
WHERE "id" LIKE 'test-heloc-notification-%';

-- Clean up test data (uncomment to run cleanup)
-- DELETE FROM "HELOCNotification" WHERE "id" LIKE 'test-heloc-notification-%';
-- DELETE FROM "HELOCRepayment" WHERE "id" LIKE 'test-heloc-payment-%';
-- DELETE FROM "HELOCDraw" WHERE "id" LIKE 'test-heloc-draw-%';
-- DELETE FROM "HELOCAccount" WHERE "id" LIKE 'test-heloc-account-%';
-- DELETE FROM "HELOCRiskAssessment" WHERE "id" LIKE 'test-risk-assessment-%';
-- DELETE FROM "HELOCApplication" WHERE "id" LIKE 'test-heloc-app-%';
-- DELETE FROM "ProtectionPlan" WHERE "id" LIKE 'test-protection-plan-%';
