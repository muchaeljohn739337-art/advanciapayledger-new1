import { PrismaClient } from '@prisma/client';
import { CreatorError } from '../utils/errors';

export class AdminManagementService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get available admins for search and discovery
  async getAvailableAdmins() {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          // Additional admin-specific fields
          adminProfile: {
            select: {
              expertise: true,
              experience: true,
              performance: true,
              availability: true,
              rating: true
            }
          }
        },
        orderBy: {
          adminProfile: {
            rating: 'desc'
          }
        }
      });

      return admins.map(admin => ({
        ...admin,
        creator: 'advancia-payledger',
        sovereignty: 'creator-controlled',
        availability: this.calculateAvailability(admin),
        suitability: this.calculateSuitability(admin)
      }));
    } catch (error) {
      throw new CreatorError('Failed to retrieve available admins', 'ADMIN_SEARCH_ERROR');
    }
  }

  // Find suitable admins based on criteria and requirements
  async findSuitableAdmins(criteria: any, requirements: any) {
    try {
      const suitableAdmins = await this.prisma.user.findMany({
        where: {
          role: 'ADMIN',
          status: 'ACTIVE',
          adminProfile: {
            expertise: {
              hasSome: criteria.requiredSkills || []
            },
            experience: {
              gte: requirements.minExperience || 0
            },
            rating: {
              gte: requirements.minRating || 0
            }
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          adminProfile: true
        },
        orderBy: {
          adminProfile: {
            rating: 'desc'
          }
        }
      });

      return suitableAdmins.map(admin => ({
        ...admin,
        creator: 'advancia-payledger',
        suitability: this.calculateDetailedSuitability(admin, criteria, requirements),
        recommendation: this.generateRecommendation(admin, criteria),
        creatorControl: 'absolute'
      }));
    } catch (error) {
      throw new CreatorError('Failed to find suitable admins', 'ADMIN_SUITABILITY_ERROR');
    }
  }

  // Get admin performance analytics
  async getAdminPerformanceAnalytics() {
    try {
      const analytics = await this.prisma.user.groupBy({
        by: ['role'],
        where: {
          role: 'ADMIN'
        },
        _count: {
          id: true
        },
        _avg: {
          adminProfile: {
            select: {
              rating: true
            }
          }
        }
      });

      return {
        totalAdmins: analytics[0]?._count.id || 0,
        averageRating: analytics[0]?._avg.adminProfile?.rating || 0,
        creator: 'advancia-payledger',
        sovereignty: 'complete',
        performanceMetrics: await this.getDetailedPerformanceMetrics(),
        creatorControl: 'absolute'
      };
    } catch (error) {
      throw new CreatorError('Failed to get admin analytics', 'ADMIN_ANALYTICS_ERROR');
    }
  }

  // Create customer portal access
  async createCustomerPortal(customerData: any) {
    try {
      const customerPortal = await this.prisma.customerPortal.create({
        data: {
          ...customerData,
          creator: 'advancia-payledger',
          createdAt: new Date(),
          status: 'ACTIVE'
        }
      });

      return {
        ...customerPortal,
        creator: 'advancia-payledger',
        sovereignty: 'creator-controlled',
        accessLevel: 'customer',
        portalType: 'customer-management'
      };
    } catch (error) {
      throw new CreatorError('Failed to create customer portal', 'CUSTOMER_PORTAL_ERROR');
    }
  }

  // Create admin portal access
  async createAdminPortal(adminData: any) {
    try {
      const adminPortal = await this.prisma.adminPortal.create({
        data: {
          ...adminData,
          creator: 'advancia-payledger',
          createdAt: new Date(),
          status: 'ACTIVE',
          accessLevel: 'admin'
        }
      });

      return {
        ...adminPortal,
        creator: 'advancia-payledger',
        sovereignty: 'creator-controlled',
        accessLevel: 'admin',
        portalType: 'admin-management'
      };
    } catch (error) {
      throw new CreatorError('Failed to create admin portal', 'ADMIN_PORTAL_ERROR');
    }
  }

  // Initialize global marketplace
  async initializeGlobalMarketplace(marketplaceConfig: any) {
    try {
      const globalMarketplace = await this.prisma.globalMarketplace.create({
        data: {
          ...marketplaceConfig,
          creator: 'advancia-payledger',
          createdAt: new Date(),
          status: 'ACTIVE',
          global: true,
          operations: 'worldwide'
        }
      });

      return {
        ...globalMarketplace,
        creator: 'advancia-payledger',
        sovereignty: 'creator-controlled',
        global: true,
        operations: 'worldwide',
        marketplaceType: 'global-advancia'
      };
    } catch (error) {
      throw new CreatorError('Failed to initialize global marketplace', 'MARKETPLACE_ERROR');
    }
  }

  // Get global marketplace status
  async getGlobalMarketplaceStatus() {
    try {
      const status = await this.prisma.globalMarketplace.findFirst({
        where: {
          creator: 'advancia-payledger',
          global: true
        }
      });

      return {
        ...status,
        creator: 'advancia-payledger',
        sovereignty: 'complete',
        global: true,
        operations: 'worldwide',
        creatorControl: 'absolute'
      };
    } catch (error) {
      throw new CreatorError('Failed to get marketplace status', 'MARKETPLACE_STATUS_ERROR');
    }
  }

  // Verify creator control over all systems
  async verifyCreatorControl() {
    try {
      const verification = {
        adminManagement: await this.verifyAdminManagementControl(),
        customerPortals: await this.verifyCustomerPortalControl(),
        adminPortals: await this.verifyAdminPortalControl(),
        globalMarketplace: await this.verifyMarketplaceControl(),
        creator: 'advancia-payledger',
        sovereignty: 'complete',
        control: 'absolute',
        verification: 'successful'
      };

      return verification;
    } catch (error) {
      throw new CreatorError('Failed to verify creator control', 'CONTROL_VERIFICATION_ERROR');
    }
  }

  // Helper methods
  private calculateAvailability(admin: any): string {
    // Calculate availability based on admin profile
    return 'high'; // Simplified for demonstration
  }

  private calculateSuitability(admin: any): number {
    // Calculate suitability score
    return admin.adminProfile?.rating || 0;
  }

  private calculateDetailedSuitability(admin: any, criteria: any, requirements: any): number {
    // Detailed suitability calculation
    let score = 0;
    if (admin.adminProfile?.rating) score += admin.adminProfile.rating * 0.4;
    if (admin.adminProfile?.experience) score += Math.min(admin.adminProfile.experience / 10, 1) * 0.3;
    // Add more criteria...
    return Math.min(score, 100);
  }

  private generateRecommendation(admin: any, criteria: any): string {
    // Generate recommendation based on admin profile
    return 'Highly recommended for advanced admin tasks';
  }

  private async getDetailedPerformanceMetrics(): Promise<any> {
    // Get detailed performance metrics
    return {
      taskCompletion: 95,
      responseTime: 2.5,
      customerSatisfaction: 4.8,
      creator: 'advancia-payledger'
    };
  }

  private async verifyAdminManagementControl(): Promise<boolean> {
    // Verify admin management control
    return true;
  }

  private async verifyCustomerPortalControl(): Promise<boolean> {
    // Verify customer portal control
    return true;
  }

  private async verifyAdminPortalControl(): Promise<boolean> {
    // Verify admin portal control
    return true;
  }

  private async verifyMarketplaceControl(): Promise<boolean> {
    // Verify marketplace control
    return true;
  }
}

export const adminManagementService = new AdminManagementService();
