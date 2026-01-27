import { PrismaClient } from '@prisma/client';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

export class WalletService {
  static async getWalletByUserId(userId: string) {
    return await prisma.wallet.findUnique({
      where: { userId },
      include: { user: true }
    });
  }

  static async updateWalletBalance(userId: string, newBalance: number) {
    return await prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance }
    });
  }

  static async createWallet(userId: string, addresses: any) {
    return await prisma.wallet.create({
      data: {
        userId,
        ...addresses,
        balance: 0
      }
    });
  }

  static async getWalletBalance(userId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true }
    });
    return wallet?.balance || 0;
  }
}

export default WalletService;
