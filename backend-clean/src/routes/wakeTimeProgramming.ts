// Rockefeller HELOC Wake Time Programming API Routes
// Implements the philosophy: "I was programmed to wake up at a particular time right"
// Reference Number: 123456789-HELOC

import express from 'express';
import WakeTimeProgrammingService from '../services/WakeTimeProgrammingService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const wakeTimeProgrammingService = WakeTimeProgrammingService;

// POST /api/wake-time-programming/analyze - Analyze wake time programming
router.post('/analyze', authenticateToken, async (req, res) => {
  try {
    const { wakeTimeData } = req.body;
    const userId = req.user.id;

    if (!wakeTimeData || !Array.isArray(wakeTimeData)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: wakeTimeData (array)'
      });
    }

    const result = await wakeTimeProgrammingService.analyzeWakeTimeProgramming(userId, wakeTimeData);

    res.json({
      success: true,
      message: result.message,
      data: {
        analysis: result.analysis,
        program: result.program,
        deviations: result.deviations,
        overrides: result.overrides,
        philosophy: 'I was programmed to wake up at a particular time right'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time programming analysis failed: ${error.message}`
    });
  }
});

// POST /api/wake-time-programming/override - Override wake time programming
router.post('/override', authenticateToken, async (req, res) => {
  try {
    const { overrideTime, reason } = req.body;
    const userId = req.user.id;

    if (!overrideTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: overrideTime, reason'
      });
    }

    const result = await wakeTimeProgrammingService.processWakeTimeOverride(userId, overrideTime, reason);

    res.json({
      success: true,
      message: result.message,
      data: {
        override: result.override,
        updatedProgram: result.updatedProgram,
        philosophy: 'Conscious choice to override programmed wake time'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time override processing failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/my-program - Get user's wake time program
router.get('/my-program', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const program = await wakeTimeProgrammingService.getWakeTimeProgramByUserId(userId);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Wake time program not found'
      });
    }

    const deviations = await wakeTimeProgrammingService.getWakeTimeDeviations(program.id);
    const overrides = await wakeTimeProgrammingService.getWakeTimeOverrides(program.id);

    res.json({
      success: true,
      message: 'Wake time program retrieved',
      data: {
        program,
        deviations,
        overrides,
        totalDeviations: deviations.length,
        totalOverrides: overrides.length,
        philosophy: 'Your wake time programming and patterns'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time program retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/all-programs - Get all wake time programs
router.get('/all-programs', authenticateToken, async (req, res) => {
  try {
    const programs = await wakeTimeProgrammingService.getAllWakeTimePrograms();

    res.json({
      success: true,
      message: `Found ${programs.length} wake time programs`,
      data: {
        programs,
        totalPrograms: programs.length,
        averageProgrammingStrength: programs.reduce((sum, p) => sum + p.programmingStrength, 0) / Math.max(programs.length, 1),
        averageAwarenessLevel: programs.reduce((sum, p) => sum + p.awarenessLevel, 0) / Math.max(programs.length, 1),
        philosophy: 'All wake time programming patterns'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time programs retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/universal-times - Get universal wake time patterns
router.get('/universal-times', authenticateToken, async (req, res) => {
  try {
    const universalTimes = await wakeTimeProgrammingService.getUniversalWakeTimes();

    res.json({
      success: true,
      message: 'Universal wake time patterns retrieved',
      data: {
        universalTimes: Object.fromEntries(universalTimes),
        totalPatterns: universalTimes.size,
        philosophy: 'Universal wake time programming patterns'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Universal wake times retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/:programId - Get specific wake time program
router.get('/:programId', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.id;

    const program = await wakeTimeProgrammingService.getWakeTimeProgram(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Wake time program not found'
      });
    }

    // Verify ownership
    if (program.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const deviations = await wakeTimeProgrammingService.getWakeTimeDeviations(programId);
    const overrides = await wakeTimeProgrammingService.getWakeTimeOverrides(programId);

    res.json({
      success: true,
      message: 'Wake time program retrieved',
      data: {
        program,
        deviations,
        overrides,
        philosophy: 'Specific wake time programming details'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time program retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/deviations/:programId - Get wake time deviations
router.get('/deviations/:programId', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.id;

    const program = await wakeTimeProgrammingService.getWakeTimeProgram(programId);
    
    if (!program || program.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Wake time program not found or access denied'
      });
    }

    const deviations = await wakeTimeProgrammingService.getWakeTimeDeviations(programId);

    res.json({
      success: true,
      message: `Found ${deviations.length} wake time deviations`,
      data: {
        deviations,
        totalDeviations: deviations.length,
        averageDeviation: deviations.reduce((sum, d) => sum + Math.abs(d.deviationMinutes), 0) / Math.max(deviations.length, 1),
        deviationPattern: program.deviationPattern,
        philosophy: 'Wake time deviation history'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time deviations retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/overrides/:programId - Get wake time overrides
router.get('/overrides/:programId', authenticateToken, async (req, res) => {
  try {
    const { programId } = req.params;
    const userId = req.user.id;

    const program = await wakeTimeProgrammingService.getWakeTimeProgram(programId);
    
    if (!program || program.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Wake time program not found or access denied'
      });
    }

    const overrides = await wakeTimeProgrammingService.getWakeTimeOverrides(programId);

    res.json({
      success: true,
      message: `Found ${overrides.length} wake time overrides`,
      data: {
        overrides,
        totalOverrides: overrides.length,
        averageSuccessRate: overrides.reduce((sum, o) => sum + o.successRate, 0) / Math.max(overrides.length, 1),
        averageFreedomLevel: overrides.reduce((sum, o) => sum + o.freedomLevel, 0) / Math.max(overrides.length, 1),
        averageGuiltLevel: overrides.reduce((sum, o) => sum + o.guiltLevel, 0) / Math.max(overrides.length, 1),
        philosophy: 'Wake time override history'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Wake time overrides retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/philosophy - Get wake time programming philosophy
router.get('/philosophy', authenticateToken, async (req, res) => {
  try {
    const philosophy = {
      title: "Wake Time Programming Philosophy",
      corePrinciple: "I was programmed to wake up at a particular time right",
      description: "The realization that wake times are programmed by external forces, not natural choice",
      keyInsights: [
        "I was programmed to wake up at a particular time right",
        "Wake times follow industrial, agricultural, or digital programming",
        "Deviations from programmed times indicate awareness",
        "Guilt vs freedom when overriding programming",
        "Everyone is programmed with specific wake times"
      ],
      programmingSources: {
        INDUSTRIAL: "06:00 - Factory work schedule programming",
        AGRICULTURAL: "05:30 - Farm work schedule programming",
        DIGITAL: "07:00 - Remote work flexibility programming",
        BIOLOGICAL: "06:30 - Natural circadian rhythm programming",
        COLLECTIVE: "06:15 - Social synchronization programming"
      },
      programmingLevels: {
        PROGRAMMED: "Following programmed wake time without awareness",
        QUESTIONING: "Noticing inconsistencies in wake patterns",
        OVERRIDING: "Consciously choosing different wake times",
        TRANSCENDED: "Operating with awareness of programming"
      },
      realizationProcess: [
        "I just wake up when I need to",
        "I was programmed to wake up at a particular time right",
        "I was programmed to wake up at a particular time right by [source] programming",
        "I was programmed to wake up at a particular time right, and I'm becoming aware of it"
      ],
      overrideTypes: {
        CONSCIOUS_CHOICE: "Deliberate decision to wake at different time",
        NATURAL_RHYTHM: "Following body's natural wake signals",
        EXTERNAL_FORCE: "External circumstances forcing different wake time",
        EMOTIONAL_STATE: "Emotional state affecting wake time"
      },
      freedomAnalysis: {
        guiltLevel: "Programmed response to deviation",
        freedomLevel: "Independence from programming",
        successRate: "Effectiveness of override attempts",
        awarenessLevel: "Understanding of programming"
      },
      universalTruth: "Wake times are programmed by societal, biological, and technological forces. True freedom comes from awareness of this programming and making conscious choices."
    };

    res.json({
      success: true,
      message: "Wake time programming philosophy retrieved",
      data: philosophy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Philosophy retrieval failed: ${error.message}`
    });
  }
});

// GET /api/wake-time-programming/health - Check wake time programming service health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const health = {
      status: "Programmed",
      service: "Wake Time Programming Service",
      philosophy: "I was programmed to wake up at a particular time right",
      uptime: process.uptime(),
      totalPrograms: (await wakeTimeProgrammingService.getAllWakeTimePrograms()).length,
      message: "Service actively analyzing wake time programming patterns"
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
