import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { Prisma } from '@prisma/client';

// Types
export interface SpinResult {
  percentage: number;
  amount: number;
  bonusBalance: number;
}

export class BonusService {

  // Get user cards with balance
  async getUserCards(userId: string) {
    try {
      // Ensure Base card exists for user
      await this.ensureBaseCard(userId);

      // Process expirations lazily
      await this.processExpirations(userId);

      const userCards = await prisma.userBonusCard.findMany({
        where: { userId, isActive: true },
        include: {
          card: true,
        },
      });

      // Format for frontend
      return userCards.map(uc => ({
        id: uc.id,
        cardCode: uc.card.code, // 'BASE', 'PARTNER'
        name: uc.card.name,
        balance: uc.balance,
        imageUrl: uc.card.imageUrl,
        settings: uc.card.settings,
      }));
    } catch (error) {
      logger.error(`Error getting user cards for ${userId}:`, error);
      throw error;
    }
  }

  // Process expired bonuses
  private async processExpirations(userId: string) {
    try {
      const now = new Date();

      // Find unexpired accruals that should be expired
      const expiredAccruals = await prisma.bonusTransaction.findMany({
        where: {
          userCard: { userId },
          type: 'ACCRUAL',
          isExpired: false,
          expiresAt: { lt: now }
        }
      });

      for (const txn of expiredAccruals) {
        // Create expiration transaction and deduct balance
        await prisma.$transaction([
          prisma.bonusTransaction.update({
            where: { id: txn.id },
            data: { isExpired: true }
          }),
          prisma.bonusTransaction.create({
            data: {
              userCardId: txn.userCardId,
              amount: -txn.amount, // Deduct the amount
              type: 'EXPIRATION',
              description: `Expired bonus from ${txn.createdAt.toISOString().split('T')[0]}`,
            }
          }),
          prisma.userBonusCard.update({
            where: { id: txn.userCardId },
            data: { balance: { decrement: txn.amount } }
          })
        ]);

        // Sync global user balance (temporary logic for Base card)
        const updatedCard = await prisma.userBonusCard.findUnique({
          where: { id: txn.userCardId },
          include: { card: true }
        });

        if (updatedCard && updatedCard.card.code === 'BASE') {
          await prisma.user.update({
            where: { id: userId },
            data: { bonusBalance: updatedCard.balance }
          });
        }
      }
    } catch (error) {
      logger.error(`Error processing expirations for ${userId}:`, error);
      // Don't throw, just log
    }
  }

  // Calculate max redemption for a purchase
  async calculateMaxRedemption(userId: string, purchaseAmount: number): Promise<{ maxBonus: number, availableBonus: number }> {
    const baseCard = await prisma.bonusCard.findUnique({ where: { code: 'BASE' } });
    if (!baseCard) return { maxBonus: 0, availableBonus: 0 };

    const userCard = await prisma.userBonusCard.findUnique({
      where: { userId_cardId: { userId, cardId: baseCard.id } }
    });

    if (!userCard) return { maxBonus: 0, availableBonus: 0 };

    const settings = baseCard.settings as { maxRedemptionPercent?: number };
    const maxPercent = settings?.maxRedemptionPercent || 0;

    const maxByPolicy = Math.floor(purchaseAmount * (maxPercent / 100));
    const maxBonus = Math.min(maxByPolicy, userCard.balance);

    return { maxBonus, availableBonus: userCard.balance };
  }

  // Ensure the user has a Base card (and Partner card placeholder)
  private async ensureBaseCard(userId: string) {
    const baseCard = await prisma.bonusCard.findUnique({ where: { code: 'BASE' } });
    if (!baseCard) {
      // Should be seeded, but log warning
      logger.warn('Base card configuration missing in DB');
      return;
    }

    const userCard = await prisma.userBonusCard.findUnique({
      where: {
        userId_cardId: {
          userId,
          cardId: baseCard.id
        }
      }
    });

    if (!userCard) {
      await prisma.userBonusCard.create({
        data: {
          userId,
          cardId: baseCard.id,
          balance: 0 // Initial balance
        }
      });
    }
  }

  // Spin the wheel logic
  async spinWheel(userId: string, purchaseAmount: number): Promise<SpinResult> {
    // 1. Get Base Card
    const baseCard = await prisma.bonusCard.findUnique({ where: { code: 'BASE' } });
    if (!baseCard) throw new Error('Base card not found');

    // 2. Get User Card
    let userCard = await prisma.userBonusCard.findUnique({
      where: { userId_cardId: { userId, cardId: baseCard.id } }
    });

    if (!userCard) {
      userCard = await prisma.userBonusCard.create({
        data: { userId, cardId: baseCard.id, balance: 0 }
      });
    }

    // 3. Get Options
    const options = await prisma.bonusWheelOption.findMany({
      where: { cardId: baseCard.id, isActive: true }
    });

    if (options.length === 0) {
      return { percentage: 0, amount: 0, bonusBalance: userCard.balance };
    }

    // 4. Weighted Random Selection
    const totalWeight = options.reduce((sum, opt) => sum + opt.probability, 0);
    let random = Math.random() * totalWeight;

    let selectedOption = options[0];
    for (const option of options) {
      random -= option.probability;
      if (random <= 0) {
        selectedOption = option;
        break;
      }
    }

    // 5. Calculate Bonus
    const bonusAmount = Math.floor(purchaseAmount * (selectedOption.percentage / 100));

    // 6. Create Transaction & Update Balance
    const [transaction, updatedUserCard] = await prisma.$transaction([
      prisma.bonusTransaction.create({
        data: {
          userCardId: userCard.id,
          amount: bonusAmount,
          type: 'ACCRUAL',
          description: `Wheel spin bonus (${selectedOption.percentage}%) for purchase ${purchaseAmount}`,
          expiresAt: this.calculateExpiration(baseCard.settings),
        }
      }),
      prisma.userBonusCard.update({
        where: { id: userCard.id },
        data: { balance: { increment: bonusAmount } }
      })
    ]);

    // Sync with User model bonusBalance
    await prisma.user.update({
      where: { id: userId },
      data: { bonusBalance: updatedUserCard.balance }
    });

    return {
      percentage: selectedOption.percentage,
      amount: bonusAmount,
      bonusBalance: updatedUserCard.balance
    };
  }

  private calculateExpiration(settings: any): Date | null {
    if (!settings || typeof settings !== 'object') return null;
    // settings is Json, cast it
    const conf = settings as { expirationMonths?: number };
    if (!conf.expirationMonths) return null;

    const date = new Date();
    date.setMonth(date.getMonth() + conf.expirationMonths);
    return date;
  }

  // Activate Founder's Card
  async activateFounderCard(userId: string) {
    const founderCard = await prisma.bonusCard.findUnique({ where: { code: 'FOUNDER' } });
    if (!founderCard) throw new Error('Founder card configuration missing');

    const existingCard = await prisma.userBonusCard.findUnique({
      where: { userId_cardId: { userId, cardId: founderCard.id } }
    });

    if (existingCard) {
      return existingCard;
    }

    // Create card with 30000 bonuses
    const settings = founderCard.settings as { initialBalance?: number };
    const initialBalance = settings?.initialBalance || 30000;

    const userCard = await prisma.userBonusCard.create({
      data: {
        userId,
        cardId: founderCard.id,
        balance: initialBalance,
        isActive: true
      }
    });

    // Create transaction record
    await prisma.bonusTransaction.create({
      data: {
        userCardId: userCard.id,
        amount: initialBalance,
        type: 'ACCRUAL',
        description: 'Активация Карты Основателя',
        expiresAt: new Date('2026-12-31T23:59:59.999Z')
      }
    });

    return userCard;
  }

  // Award prize bonuses to Base card
  async awardPrizeBonuses(userId: string, amount: number, description: string = 'Призовые бонусы') {
    try {
      // Ensure user has Base card
      await this.ensureBaseCard(userId);

      // Get Base Card
      const baseCard = await prisma.bonusCard.findUnique({ where: { code: 'BASE' } });
      if (!baseCard) {
        throw new Error('Base card not found');
      }

      // Get User's Base Card
      const userCard = await prisma.userBonusCard.findUnique({
        where: { userId_cardId: { userId, cardId: baseCard.id } }
      });

      if (!userCard) {
        throw new Error('User base card not found');
      }

      // Create transaction and update balance
      const [transaction, updatedUserCard] = await prisma.$transaction([
        prisma.bonusTransaction.create({
          data: {
            userCardId: userCard.id,
            amount,
            type: 'ACCRUAL',
            description,
            expiresAt: this.calculateExpiration(baseCard.settings),
          }
        }),
        prisma.userBonusCard.update({
          where: { id: userCard.id },
          data: { balance: { increment: amount } }
        })
      ]);

      // Sync with User model bonusBalance (legacy field)
      await prisma.user.update({
        where: { id: userId },
        data: { bonusBalance: updatedUserCard.balance }
      });

      logger.info(`Awarded ${amount} prize bonuses to user ${userId} on Base card`);

      return {
        amount,
        newBalance: updatedUserCard.balance,
        transactionId: transaction.id
      };
    } catch (error) {
      logger.error(`Error awarding prize bonuses to user ${userId}:`, error);
      throw error;
    }
  }
}

export const bonusService = new BonusService();
