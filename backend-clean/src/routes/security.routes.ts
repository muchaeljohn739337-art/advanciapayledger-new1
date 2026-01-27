/**
 * Security Routes - Advancia Pay Ledger
 * 
 * Security management endpoints using the Advancia Pay Ledger master key
 */

import { Router } from 'express';
import { advanciaSecurityService } from '../services/advanciaSecurity.service';
import { authenticateApiKey, authenticateAdmin, verifyWebhookSignature } from '../middleware/advanciaAuth';

const router = Router();

/**
 * Generate API token
 * POST /api/security/generate-token
 */
router.post('/generate-token', authenticateApiKey, async (req, res) => {
  try {
    const { payload, expiresIn = 3600 } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    const token = advanciaSecurityService.generateApiToken(payload, expiresIn);

    res.json({
      success: true,
      token,
      expiresIn,
      issuedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify API token
 * POST /api/security/verify-token
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const payload = advanciaSecurityService.verifyApiToken(token);

    res.json({
      success: true,
      payload,
      valid: true,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.json({
      success: false,
      valid: false,
      error: error.message
    });
  }
});

/**
 * Encrypt data
 * POST /api/security/encrypt
 */
router.post('/encrypt', authenticateApiKey, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data to encrypt is required' });
    }

    const encrypted = advanciaSecurityService.encrypt(data);

    res.json({
      success: true,
      encrypted,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Decrypt data
 * POST /api/security/decrypt
 */
router.post('/decrypt', authenticateApiKey, async (req, res) => {
  try {
    const { encrypted, iv, tag } = req.body;

    if (!encrypted || !iv || !tag) {
      return res.status(400).json({ error: 'Encrypted data, IV, and tag are required' });
    }

    const decrypted = advanciaSecurityService.decrypt(encrypted, iv, tag);

    res.json({
      success: true,
      data: decrypted,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate webhook signature
 * POST /api/security/webhook-signature
 */
router.post('/webhook-signature', authenticateApiKey, async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    const signature = advanciaSecurityService.generateWebhookSignature(
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    );

    res.json({
      success: true,
      signature,
      payload,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Webhook signature error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify webhook signature
 * POST /api/security/verify-webhook
 */
router.post('/verify-webhook', verifyWebhookSignature, async (req, res) => {
  try {
    const signature = req.headers['x-advancia-signature'] as string;
    const payload = JSON.stringify(req.body);

    const isValid = advanciaSecurityService.verifyWebhookSignature(payload, signature);

    res.json({
      success: true,
      valid: isValid,
      payload: req.body,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Webhook verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Hash password
 * POST /api/security/hash-password
 */
router.post('/hash-password', authenticateApiKey, async (req, res) => {
  try {
    const { password, salt } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashed = advanciaSecurityService.hashPassword(password, salt);

    res.json({
      success: true,
      hash: hashed.hash,
      salt: hashed.salt,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Password hashing error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verify password
 * POST /api/security/verify-password
 */
router.post('/verify-password', authenticateApiKey, async (req, res) => {
  try {
    const { password, hash, salt } = req.body;

    if (!password || !hash || !salt) {
      return res.status(400).json({ error: 'Password, hash, and salt are required' });
    }

    const isValid = advanciaSecurityService.verifyPassword(password, hash, salt);

    res.json({
      success: true,
      valid: isValid,
      verifiedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Password verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate secure random string
 * GET /api/security/random
 */
router.get('/random', authenticateApiKey, async (req, res) => {
  try {
    const length = parseInt(req.query.length as string) || 32;
    const randomString = advanciaSecurityService.generateSecureRandom(length);

    res.json({
      success: true,
      random: randomString,
      length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Random generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create external API key
 * POST /api/security/create-external-key
 */
router.post('/create-external-key', authenticateAdmin, async (req, res) => {
  try {
    const { service, permissions } = req.body;

    if (!service || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Service and permissions array are required' });
    }

    const apiKey = advanciaSecurityService.createExternalApiKey(service, permissions);

    res.json({
      success: true,
      apiKey,
      service,
      permissions,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('External API key creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Security service health check
 * GET /api/security/health
 */
router.get('/health', async (req, res) => {
  const isConfigured = advanciaSecurityService.isConfigured();
  
  res.json({
    service: 'Advancia Security',
    status: isConfigured ? 'healthy' : 'not_configured',
    configured: isConfigured,
    features: {
      apiAuthentication: isConfigured,
      encryption: isConfigured,
      webhookVerification: isConfigured,
      tokenGeneration: isConfigured,
      passwordHashing: true
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
