// Rockefeller HELOC Cancel Money API Routes
// Implements the "We make money by canceling money" philosophy
// Reference Number: 123456789-HELOC

import express from 'express';
import CancelMoneyService from '../services/CancelMoneyService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const cancelMoneyService = CancelMoneyService;

// POST /api/cancel-money/transaction - Cancel a specific transaction
router.post('/transaction', authenticateToken, async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    const canceledBy = req.user.id;

    const result = await cancelMoneyService.cancelMoney(transactionId, reason, canceledBy);

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          cancelTransaction: result.cancelTransaction,
          netProfit: result.netProfit,
          philosophy: "Money made by canceling money"
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Cancelation failed: ${error.message}`
    });
  }
});

// GET /api/cancel-money/opportunities - Find profitable cancelation opportunities
router.get('/opportunities', authenticateToken, async (req, res) => {
  try {
    const opportunities = await cancelMoneyService.identifyProfitableCancellations();

    res.json({
      success: true,
      message: `Found ${opportunities.candidates.length} profitable cancelation opportunities`,
      data: {
        candidates: opportunities.candidates,
        totalPotentialProfit: opportunities.totalPotentialProfit,
        philosophy: "We profit from canceling, not making"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to identify opportunities: ${error.message}`
    });
  }
});

// POST /api/cancel-money/batch - Execute batch cancelation
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const { transactionIds, reason } = req.body;
    const canceledBy = req.user.id;

    const result = await cancelMoneyService.executeBatchCancelation(transactionIds, reason, canceledBy);

    res.json({
      success: result.success,
      message: `Batch cancelation completed. Total profit: $${result.totalNetProfit.toFixed(2)}`,
      data: {
        results: result.results,
        totalNetProfit: result.totalNetProfit,
        philosophy: "Batch cancelation for maximum profit"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Batch cancelation failed: ${error.message}`
    });
  }
});

// GET /api/cancel-money/metrics - Get cancelation philosophy metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await cancelMoneyService.getCancelationPhilosophyMetrics();

    res.json({
      success: true,
      message: "Cancelation philosophy metrics retrieved",
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve metrics: ${error.message}`
    });
  }
});

// GET /api/cancel-money/report/:timeframe - Generate cancelation report
router.get('/report/:timeframe', authenticateToken, async (req, res) => {
  try {
    const { timeframe } = req.params;
    
    if (!['day', 'week', 'month'].includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: "Invalid timeframe. Use: day, week, or month"
      });
    }

    const report = await cancelMoneyService.generateCancelationReport(timeframe);

    res.json({
      success: true,
      message: `${timeframe}ly cancelation report generated`,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to generate report: ${error.message}`
    });
  }
});

// POST /api/cancel-money/auto-cancelation - Start automatic cancelation
router.post('/auto-cancelation', authenticateToken, async (req, res) => {
  try {
    await cancelMoneyService.startAutomaticCancelation();

    res.json({
      success: true,
      message: "Automatic cancelation started",
      data: {
        philosophy: "Systematic profit generation through automatic cancelation",
        status: "Active"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to start automatic cancelation: ${error.message}`
    });
  }
});

// GET /api/cancel-money/philosophy - Get the cancel money philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "The Cancel Money Philosophy",
      corePrinciple: "We make money by canceling money",
      description: "While everyone else tries to make money and goes broke, we cancel money and prosper.",
      keyPoints: [
        "Every attempt to make money results in bankruptcy",
        "The only path to prosperity is canceling money",
        "Value creation through value destruction",
        "Wealth accumulation through liability elimination",
        "Risk reduction through strategic cancelation"
      ],
      mathematicalProof: {
        traditional: "Revenue - Costs = Profit (Usually Negative)",
        cancelation: "Liability Eliminated + Risk Reduction = Profit (Always Positive)"
      },
      implementation: {
        heLOC: "Applied to HELOC applications, loans, and risk management",
        automation: "Systematic identification and execution of profitable cancelations",
        metrics: "Continuous tracking of cancelation profitability and efficiency"
      }
    };

    res.json({
      success: true,
      message: "Cancel money philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Failed to retrieve philosophy: ${error.message}`
    });
  }
});

// GET /api/cancel-money/health - Check cancelation service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = {
      status: "Healthy",
      philosophy: "Cancel Money to Make Money",
      service: "Cancel Money Service",
      uptime: process.uptime(),
      metrics: {
        totalCanceled: 0, // Would be actual metrics
        netProfit: 0,
        cancelationRate: 0,
        profitability: 0
      },
      message: "Service is actively canceling money for profit"
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Health check failed: ${error.message}`
    });
  }
});

export default router;
