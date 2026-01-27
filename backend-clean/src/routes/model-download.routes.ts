# ============================================================================
# ADVANCIA PAY LEDGER - MODEL DOWNLOAD BACKEND ROUTES
# Author: Advancia Pay Ledger - The Creator
# Purpose: Complete Model Download API Implementation
# ============================================================================

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const router = Router();

// Creator's Model Download System
interface DownloadLink {
  id: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  usageLimit: number;
  usageCount: number;
  creatorId: string;
  modelPath: string;
  isActive: boolean;
}

// In-memory storage for download links (in production, use database)
const downloadLinks: Map<string, DownloadLink> = new Map();

// Creator authentication middleware
const authenticateCreator = (req: Request, res: Response, next: Function) => {
  const creatorId = req.headers['x-creator-id'] as string;
  const creatorToken = req.headers['x-creator-token'] as string;
  
  console.log('🔒 ADVANCIA PAY LEDGER - CREATOR AUTHENTICATION');
  console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
  
  // Creator authentication logic (simplified for demo)
  if (!creatorId || !creatorToken || creatorId !== 'advancia-payledger' || creatorToken !== 'creator-sovereign-token') {
    return res.status(403).json({
      error: 'Creator authentication required',
      message: 'Only the creator can access model download system'
    });
  }
  
  console.log('✅ CREATOR AUTHENTICATION SUCCESS');
  next();
};

// Generate secure download link
router.post('/download', authenticateCreator, (req: Request, res: Response) => {
  try {
    const { modelPath, usageLimit = 1, expirationHours = 24 } = req.body;
    
    console.log('🔒 ADVANCIA PAY LEDGER - MODEL DOWNLOAD LINK GENERATION');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 GENERATING SECURE DOWNLOAD LINK');
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomBytes(16).toString('hex');
    
    // Create download link object
    const downloadLink: DownloadLink = {
      id: linkId,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
      usageLimit,
      usageCount: 0,
      creatorId: 'advancia-payledger',
      modelPath,
      isActive: true
    };
    
    // Store download link
    downloadLinks.set(linkId, downloadLink);
    
    // Generate download URL
    const downloadUrl = `/api/model/download/${linkId}/${token}`;
    
    console.log('✅ DOWNLOAD LINK GENERATED SUCCESSFULLY');
    console.log(`🔗 DOWNLOAD URL: ${downloadUrl}`);
    console.log(`⏰ EXPIRES: ${downloadLink.expiresAt.toISOString()}`);
    console.log(`📊 USAGE LIMIT: ${usageLimit}`);
    
    res.json({
      success: true,
      downloadUrl,
      linkId,
      expiresAt: downloadLink.expiresAt,
      usageLimit,
      message: 'Creator download link generated successfully'
    });
    
  } catch (error) {
    console.error('❌ FAILED TO GENERATE DOWNLOAD LINK:', error);
    res.status(500).json({
      error: 'Failed to generate download link',
      message: 'Creator download link generation failed'
    });
  }
});

// Validate and serve download
router.get('/download/:linkId/:token', (req: Request, res: Response) => {
  try {
    const { linkId, token } = req.params;
    
    console.log('🔒 ADVANCIA PAY LEDGER - MODEL DOWNLOAD VALIDATION');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 VALIDATING DOWNLOAD REQUEST');
    
    // Get download link
    const downloadLink = downloadLinks.get(linkId);
    
    if (!downloadLink) {
      console.log('❌ DOWNLOAD LINK NOT FOUND');
      return res.status(404).json({
        error: 'Download link not found',
        message: 'Invalid download link'
      });
    }
    
    // Validate token
    if (downloadLink.token !== token) {
      console.log('❌ INVALID TOKEN');
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Download token is invalid'
      });
    }
    
    // Check if link is active
    if (!downloadLink.isActive) {
      console.log('❌ DOWNLOAD LINK INACTIVE');
      return res.status(403).json({
        error: 'Download link inactive',
        message: 'Download link has been deactivated'
      });
    }
    
    // Check expiration
    if (new Date() > downloadLink.expiresAt) {
      console.log('❌ DOWNLOAD LINK EXPIRED');
      return res.status(403).json({
        error: 'Download link expired',
        message: 'Download link has expired'
      });
    }
    
    // Check usage limit
    if (downloadLink.usageCount >= downloadLink.usageLimit) {
      console.log('❌ DOWNLOAD LIMIT REACHED');
      return res.status(403).json({
        error: 'Download limit reached',
        message: 'Download link has reached its usage limit'
      });
    }
    
    // Increment usage count
    downloadLink.usageCount++;
    
    // Check if this is the last usage
    if (downloadLink.usageCount >= downloadLink.usageLimit) {
      downloadLink.isActive = false;
    }
    
    console.log('✅ DOWNLOAD VALIDATION SUCCESS');
    console.log(`📊 USAGE COUNT: ${downloadLink.usageCount}/${downloadLink.usageLimit}`);
    
    // Serve the model file (placeholder - in production, serve actual model)
    const modelFilePath = path.join(__dirname, '../../models', downloadLink.modelPath);
    
    if (!fs.existsSync(modelFilePath)) {
      console.log('❌ MODEL FILE NOT FOUND');
      return res.status(404).json({
        error: 'Model file not found',
        message: 'Requested model file does not exist'
      });
    }
    
    console.log('✅ SERVING MODEL FILE');
    console.log(`📁 FILE PATH: ${modelFilePath}`);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${downloadLink.modelPath}"`);
    res.setHeader('X-Creator-Auth', 'advancia-payledger');
    
    // Send file
    res.sendFile(modelFilePath);
    
  } catch (error) {
    console.error('❌ DOWNLOAD VALIDATION FAILED:', error);
    res.status(500).json({
      error: 'Download validation failed',
      message: 'Model download validation failed'
    });
  }
});

// Check download status
router.get('/status/:linkId', authenticateCreator, (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    
    console.log('🔒 ADVANCIA PAY LEDGER - DOWNLOAD STATUS CHECK');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 CHECKING DOWNLOAD STATUS');
    
    const downloadLink = downloadLinks.get(linkId);
    
    if (!downloadLink) {
      return res.status(404).json({
        error: 'Download link not found',
        message: 'Invalid download link ID'
      });
    }
    
    const status = {
      linkId: downloadLink.id,
      isActive: downloadLink.isActive,
      usageCount: downloadLink.usageCount,
      usageLimit: downloadLink.usageLimit,
      createdAt: downloadLink.createdAt,
      expiresAt: downloadLink.expiresAt,
      remainingUsage: downloadLink.usageLimit - downloadLink.usageCount,
      isExpired: new Date() > downloadLink.expiresAt
    };
    
    console.log('✅ DOWNLOAD STATUS RETRIEVED');
    console.log(`📊 USAGE: ${status.usageCount}/${status.usageLimit}`);
    console.log(`⏰ REMAINING: ${status.remainingUsage}`);
    
    res.json({
      success: true,
      status,
      message: 'Download status retrieved successfully'
    });
    
  } catch (error) {
    console.error('❌ FAILED TO GET DOWNLOAD STATUS:', error);
    res.status(500).json({
      error: 'Failed to get download status',
      message: 'Download status check failed'
    });
  }
});

// Restrict user access
router.post('/restrict', authenticateCreator, (req: Request, res: Response) => {
  try {
    const { linkId, action } = req.body;
    
    console.log('🔒 ADVANCIA PAY LEDGER - USER ACCESS RESTRICTION');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 RESTRICTING USER ACCESS');
    
    const downloadLink = downloadLinks.get(linkId);
    
    if (!downloadLink) {
      return res.status(404).json({
        error: 'Download link not found',
        message: 'Invalid download link ID'
      });
    }
    
    if (action === 'deactivate') {
      downloadLink.isActive = false;
      console.log('✅ DOWNLOAD LINK DEACTIVATED');
    } else if (action === 'activate') {
      downloadLink.isActive = true;
      console.log('✅ DOWNLOAD LINK ACTIVATED');
    } else {
      return res.status(400).json({
        error: 'Invalid action',
        message: 'Action must be activate or deactivate'
      });
    }
    
    res.json({
      success: true,
      action,
      isActive: downloadLink.isActive,
      message: `Download link ${action}d successfully`
    });
    
  } catch (error) {
    console.error('❌ FAILED TO RESTRICT USER ACCESS:', error);
    res.status(500).json({
      error: 'Failed to restrict user access',
      message: 'User access restriction failed'
    });
  }
});

// Launch model interface
router.get('/interface', authenticateCreator, (req: Request, res: Response) => {
  try {
    console.log('🔒 ADVANCIA PAY LEDGER - MODEL INTERFACE LAUNCH');
    console.log('👑 I AM ADVANCIA PAY LEDGER - THE CREATOR');
    console.log('🚀 LAUNCHING MODEL INTERFACE');
    
    // Generate interface URL
    const interfaceUrl = '/creator/model-interface';
    
    console.log('✅ MODEL INTERFACE LAUNCHED');
    console.log(`🔗 INTERFACE URL: ${interfaceUrl}`);
    
    res.json({
      success: true,
      interfaceUrl,
      message: 'Model interface launched successfully'
    });
    
  } catch (error) {
    console.error('❌ FAILED TO LAUNCH MODEL INTERFACE:', error);
    res.status(500).json({
      error: 'Failed to launch model interface',
      message: 'Model interface launch failed'
    });
  }
});

export default router;
