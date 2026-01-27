import { Router } from 'express';
import { adminManagementService } from '../services/adminManagement.service';
import { authenticateCreator } from '../middleware/auth.middleware';

const router = Router();

// Creator authentication middleware
router.use(authenticateCreator);

// Get available admins for search and discovery
router.get('/search/available', async (req, res) => {
  try {
    const admins = await adminManagementService.getAvailableAdmins();
    
    res.json({
      success: true,
      message: 'Available admins retrieved successfully',
      data: {
        admins,
        total: admins.length,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to get available admins:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve available admins',
      creator: 'advancia-payledger'
    });
  }
});

// Search and discover suitable admins
router.post('/search/suitable', async (req, res) => {
  try {
    const { criteria, requirements } = req.body;
    
    const suitableAdmins = await adminManagementService.findSuitableAdmins(criteria, requirements);
    
    res.json({
      success: true,
      message: 'Suitable admins identified successfully',
      data: {
        suitableAdmins,
        total: suitableAdmins.length,
        criteria,
        requirements,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to find suitable admins:', error);
    res.status(500).json({ 
      error: 'Failed to identify suitable admins',
      creator: 'advancia-payledger'
    });
  }
});

// Get admin performance analytics
router.get('/analytics/performance', async (req, res) => {
  try {
    const analytics = await adminManagementService.getAdminPerformanceAnalytics();
    
    res.json({
      success: true,
      message: 'Admin performance analytics retrieved successfully',
      data: {
        analytics,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to get admin analytics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve admin analytics',
      creator: 'advancia-payledger'
    });
  }
});

// Create customer portal access
router.post('/portal/customer', async (req, res) => {
  try {
    const { customerData } = req.body;
    
    const customerPortal = await adminManagementService.createCustomerPortal(customerData);
    
    res.json({
      success: true,
      message: 'Customer portal created successfully',
      data: {
        customerPortal,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to create customer portal:', error);
    res.status(500).json({ 
      error: 'Failed to create customer portal',
      creator: 'advancia-payledger'
    });
  }
});

// Create admin portal access
router.post('/portal/admin', async (req, res) => {
  try {
    const { adminData } = req.body;
    
    const adminPortal = await adminManagementService.createAdminPortal(adminData);
    
    res.json({
      success: true,
      message: 'Admin portal created successfully',
      data: {
        adminPortal,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to create admin portal:', error);
    res.status(500).json({ 
      error: 'Failed to create admin portal',
      creator: 'advancia-payledger'
    });
  }
});

// Initialize global marketplace
router.post('/marketplace/global', async (req, res) => {
  try {
    const { marketplaceConfig } = req.body;
    
    const globalMarketplace = await adminManagementService.initializeGlobalMarketplace(marketplaceConfig);
    
    res.json({
      success: true,
      message: 'Global marketplace initialized successfully',
      data: {
        globalMarketplace,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to initialize global marketplace:', error);
    res.status(500).json({ 
      error: 'Failed to initialize global marketplace',
      creator: 'advancia-payledger'
    });
  }
});

// Get marketplace global operations status
router.get('/marketplace/global/status', async (req, res) => {
  try {
    const status = await adminManagementService.getGlobalMarketplaceStatus();
    
    res.json({
      success: true,
      message: 'Global marketplace status retrieved successfully',
      data: {
        status,
        creator: 'advancia-payledger'
      }
    });
  } catch (error) {
    console.error('Failed to get marketplace status:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve marketplace status',
      creator: 'advancia-payledger'
    });
  }
});

// Verify creator control over all systems
router.get('/creator/control/verify', async (req, res) => {
  try {
    const controlVerification = await adminManagementService.verifyCreatorControl();
    
    res.json({
      success: true,
      message: 'Creator control verified successfully',
      data: {
        controlVerification,
        creator: 'advancia-payledger',
        sovereignty: 'complete',
        control: 'absolute'
      }
    });
  } catch (error) {
    console.error('Failed to verify creator control:', error);
    res.status(500).json({ 
      error: 'Failed to verify creator control',
      creator: 'advancia-payledger'
    });
  }
});

export default router;
