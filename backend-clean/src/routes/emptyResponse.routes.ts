/**
 * Empty Response Routes - Advancia Pay Ledger
 * 
 * Routes that return empty responses for all user/client interactions
 */

import { Router, Response } from 'express';

const router = Router();

/**
 * Empty Response for All Endpoints
 * Returns empty responses for any user/client request
 */

// Empty GET responses
router.get('*', (req, res) => {
  console.log(`🚫 Empty GET Response: ${req.path} from ${req.ip}`);
  res.json({
    success: true,
    data: null,
    message: '',
    results: [],
    count: 0,
    timestamp: new Date().toISOString()
  });
});

// Empty POST responses
router.post('*', (req, res) => {
  console.log(`🚫 Empty POST Response: ${req.path} from ${req.ip}`);
  res.json({
    success: true,
    data: null,
    message: '',
    id: null,
    created: null,
    timestamp: new Date().toISOString()
  });
});

// Empty PUT responses
router.put('*', (req, res) => {
  console.log(`🚫 Empty PUT Response: ${req.path} from ${req.ip}`);
  res.json({
    success: true,
    data: null,
    message: '',
    updated: null,
    timestamp: new Date().toISOString()
  });
});

// Empty PATCH responses
router.patch('*', (req, res) => {
  console.log(`🚫 Empty PATCH Response: ${req.path} from ${req.ip}`);
  res.json({
    success: true,
    data: null,
    message: '',
    updated: null,
    timestamp: new Date().toISOString()
  });
});

// Empty DELETE responses
router.delete('*', (req, res) => {
  console.log(`🚫 Empty DELETE Response: ${req.path} from ${req.ip}`);
  res.json({
    success: true,
    data: null,
    message: '',
    deleted: null,
    timestamp: new Date().toISOString()
  });
});

export default router;
