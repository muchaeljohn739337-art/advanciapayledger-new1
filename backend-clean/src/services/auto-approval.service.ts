// ============================================================================
// AUTO-APPROVAL CRON JOB - ADVANCIA PAY LEDGER FUNDRAISING SYSTEM
// Runs every hour, approves users instantly for fundraising access
// Advancia Pay Ledger - The Creator's Financial Platform

import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendEmail } from './email.service';
import { createWallet } from './wallet.service';

/**
 * Advancia Pay Ledger Auto-approval - Fundraising access automation
 * Instant user approval for fundraising platform access
 * The Creator's financial system operates seamlessly
 */
export function startAutoApprovalCron() {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[ADVANCIA-PAY-LEDGER] Starting fundraising auto-approval check...');

      // Find users pending for instant approval
      const now = new Date();

      const pendingUsers = await prisma.user.findMany({
        where: {
          status: 'PENDING_APPROVAL',
          registeredAt: {
            lte: now,
          },
          autoApproved: false,
        },
      });

      console.log(`[ADVANCIA-PAY-LEDGER] Found ${pendingUsers.length} users awaiting fundraising platform access`);

      for (const user of pendingUsers) {
        try {
          // Update user to ACTIVE with auto-approve flag
          await prisma.user.update({
            where: { id: user.id },
            data: {
              status: 'ACTIVE',
              autoApproved: true,
              approvedBy: 'ADVANCIA_PAY_LEDGER_SYSTEM',
              approvedAt: new Date(),
            },
          });

          // Create wallet
          try {
            await createWallet(user.id, `${user.firstName} ${user.lastName}`);
          } catch (walletError) {
            console.error(`[ADVANCIA-PAY-LEDGER] Wallet creation failed for ${user.email}:`, walletError);
          }

          // Send approval email
          await sendEmail({
            to: user.email,
            template: 'account-approved',
            data: {
              firstName: user.firstName,
              loginUrl: `${process.env.FRONTEND_URL}/login`,
            },
          });

          // Create notification
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'APPROVAL',
              title: '🎉 Account Approved!',
              message: 'Your account has been approved for fundraising access.',
              link: '/dashboard',
            },
          });

          console.log(`[ADVANCIA-PAY-LEDGER] ✅ User approved for fundraising: ${user.email}`);
        } catch (error) {
          console.error(`[ADVANCIA-PAY-LEDGER] Failed to approve ${user.email}:`, error);
        }
      }

      console.log('[ADVANCIA-PAY-LEDGER] Fundraising approval check complete');
    } catch (error) {
      console.error('[ADVANCIA-PAY-LEDGER] Fundraising cron job error:', error);
    }
  });

  console.log('[ADVANCIA-PAY-LEDGER] Fundraising cron job started (approving users every hour)');
}

/**
 * Advancia Pay Ledger Manual Trigger - Fundraising approval on demand
 * For testing the fundraising approval system
 */
export async function runAutoApprovalNow() {
  console.log('[ADVANCIA-PAY-LEDGER] Fundraising manual trigger started...');

  const now = new Date();

  const pendingUsers = await prisma.user.findMany({
    where: {
      status: 'PENDING_APPROVAL',
      registeredAt: {
        lte: now,
      },
      autoApproved: false,
    },
  });

  console.log(`[ADVANCIA-PAY-LEDGER] Found ${pendingUsers.length} users for immediate fundraising access`);

  for (const user of pendingUsers) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: 'ACTIVE',
          autoApproved: true,
          approvedBy: 'ADVANCIA_PAY_LEDGER_SYSTEM',
          approvedAt: new Date(),
        },
      });

      await createWallet(user.id, `${user.firstName} ${user.lastName}`);

      await sendEmail({
        to: user.email,
        template: 'account-approved',
        data: {
          firstName: user.firstName,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'APPROVAL',
          title: '🎉 Account Approved!',
          message: 'Your account has been approved for fundraising access.',
          link: '/dashboard',
        },
      });

      console.log(`[ADVANCIA-PAY-LEDGER] ✅ User approved for fundraising: ${user.email}`);
    } catch (error) {
      console.error(`[ADVANCIA-PAY-LEDGER] ❌ Fundraising approval failed for ${user.email}:`, error);
    }
  }

  return {
    processed: pendingUsers.length,
    users: pendingUsers.map(u => u.email),
  };
}
