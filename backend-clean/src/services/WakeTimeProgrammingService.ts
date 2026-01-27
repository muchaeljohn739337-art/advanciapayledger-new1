// Rockefeller HELOC Wake Time Programming Service
// Implements the philosophy: "I was programmed to wake up at a particular time right"
// Reference Number: 123456789-HELOC

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { EventEmitter } from 'events';

interface WakeTimeProgram {
  id: string;
  userId: string;
  programmedWakeTime: string;
  actualWakeTime: string;
  programmingSource: 'INDUSTRIAL' | 'AGRICULTURAL' | 'DIGITAL' | 'BIOLOGICAL' | 'COLLECTIVE';
  programmingStrength: number; // 0 to 1
  overrideAttempts: number;
  overrideSuccess: boolean;
  deviationPattern: string;
  awarenessLevel: number; // 0 to 1
  programmingRealization: string;
  timestamp: Date;
  status: 'PROGRAMMED' | 'QUESTIONING' | 'OVERRIDING' | 'TRANSCENDED';
}

interface WakeTimeDeviation {
  id: string;
  programId: string;
  date: Date;
  programmedTime: string;
  actualTime: string;
  deviationMinutes: number;
  deviationReason: string;
  weatherCondition: string;
  seasonalFactor: string;
  emotionalState: string;
  workSchedule: string;
}

interface ProgrammingOverride {
  id: string;
  programId: string;
  overrideType: 'CONSCIOUS_CHOICE' | 'NATURAL_RHYTHM' | 'EXTERNAL_FORCE' | 'EMOTIONAL_STATE';
  overrideTime: string;
  overrideDuration: number; // days
  successRate: number; // 0 to 1
  guiltLevel: number; // 0 to 1
  freedomLevel: number; // 0 to 1
  timestamp: Date;
}

interface WakeTimeAnalysis {
  id: string;
  userId: string;
  totalDays: number;
  programmedDays: number;
  overrideDays: number;
  averageDeviation: number;
  programmingStrength: number;
  awarenessLevel: number;
  programmingSource: string;
  realizationLevel: number;
  recommendations: string[];
}

export class WakeTimeProgrammingService extends EventEmitter {
  private prisma: PrismaClient;
  private wakeTimePrograms: Map<string, WakeTimeProgram> = new Map();
  private deviations: Map<string, WakeTimeDeviation[]> = new Map();
  private overrides: Map<string, ProgrammingOverride[]> = new Map();
  private analyses: Map<string, WakeTimeAnalysis> = new Map();
  private universalWakeTimes: Map<string, string> = new Map();

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.initializeUniversalWakeTimes();
    this.startWakeTimeMonitoring();
  }

  // ANALYZE WAKE TIME PROGRAMMING
  async analyzeWakeTimeProgramming(userId: string, wakeTimeData: any[]): Promise<{
    success: boolean;
    analysis: WakeTimeAnalysis;
    program: WakeTimeProgram;
    deviations: WakeTimeDeviation[];
    overrides: ProgrammingOverride[];
    message: string;
  }> {
    try {
      // Analyze wake time patterns
      const deviations = this.analyzeWakeTimeDeviations(wakeTimeData);
      const overrides = this.analyzeProgrammingOverrides(deviations);
      
      // Determine programming source and strength
      const programmingSource = this.determineProgrammingSource(deviations);
      const programmingStrength = this.calculateProgrammingStrength(deviations, overrides);
      const awarenessLevel = this.calculateAwarenessLevel(deviations, overrides);
      const realizationLevel = this.calculateRealizationLevel(awarenessLevel, programmingSource);
      
      // Create wake time program
      const program: WakeTimeProgram = {
        id: crypto.randomUUID(),
        userId,
        programmedWakeTime: this.determineProgrammedWakeTime(deviations),
        actualWakeTime: this.calculateActualWakeTime(deviations),
        programmingSource,
        programmingStrength,
        overrideAttempts: overrides.length,
        overrideSuccess: overrides.some(o => o.successRate > 0.5),
        deviationPattern: this.analyzeDeviationPattern(deviations),
        awarenessLevel,
        programmingRealization: this.generateProgrammingRealization(awarenessLevel, programmingSource),
        timestamp: new Date(),
        status: realizationLevel > 0.8 ? 'TRANSCENDED' : realizationLevel > 0.5 ? 'OVERRIDING' : realizationLevel > 0.2 ? 'QUESTIONING' : 'PROGRAMMED'
      };

      // Create analysis
      const analysis: WakeTimeAnalysis = {
        id: crypto.randomUUID(),
        userId,
        totalDays: wakeTimeData.length,
        programmedDays: deviations.filter(d => d.deviationMinutes < 5).length,
        overrideDays: overrides.length,
        averageDeviation: deviations.reduce((sum, d) => sum + Math.abs(d.deviationMinutes), 0) / Math.max(deviations.length, 1),
        programmingStrength,
        awarenessLevel,
        programmingSource,
        realizationLevel,
        recommendations: this.generateRecommendations(program, deviations, overrides)
      };

      // Store data
      this.wakeTimePrograms.set(program.id, program);
      this.deviations.set(program.id, deviations);
      this.overrides.set(program.id, overrides);
      this.analyses.set(analysis.id, analysis);

      // Log analysis
      await this.logWakeTimeAnalysis(userId, analysis);

      // Emit analysis
      this.emit('wakeTimeProgrammingAnalyzed', {
        userId,
        analysis,
        program,
        deviations,
        overrides,
        message: 'Wake time programming analysis complete'
      });

      return {
        success: true,
        analysis,
        program,
        deviations,
        overrides,
        message: `Wake time programming analyzed: ${realizationLevel.toFixed(2)} realization level`
      };

    } catch (error) {
      return {
        success: false,
        analysis: null as any,
        program: null as any,
        deviations: [],
        overrides: [],
        message: `Wake time programming analysis failed: ${error.message}`
      };
    }
  }

  private analyzeWakeTimeDeviations(wakeTimeData: any[]): WakeTimeDeviation[] {
    return wakeTimeData.map(data => ({
      id: crypto.randomUUID(),
      programId: 'analysis',
      date: new Date(data.date),
      programmedTime: data.programmedTime || '06:00',
      actualTime: data.actualTime || '07:30',
      deviationMinutes: this.calculateDeviationMinutes(data.programmedTime, data.actualTime),
      deviationReason: data.reason || 'Natural rhythm',
      weatherCondition: data.weather || 'Clear',
      seasonalFactor: data.season || 'Normal',
      emotionalState: data.emotion || 'Neutral',
      workSchedule: data.workSchedule || 'Standard'
    }));
  }

  private calculateDeviationMinutes(programmedTime: string, actualTime: string): number {
    const prog = this.parseTime(programmedTime);
    const act = this.parseTime(actualTime);
    
    const progMinutes = prog.hours * 60 + prog.minutes;
    const actMinutes = act.hours * 60 + act.minutes;
    
    return actMinutes - progMinutes;
  }

  private parseTime(time: string): { hours: number; minutes: number } {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  }

  private analyzeProgrammingOverrides(deviations: WakeTimeDeviation[]): ProgrammingOverride[] {
    return deviations
      .filter(d => Math.abs(d.deviationMinutes) > 15)
      .map(d => ({
        id: crypto.randomUUID(),
        programId: 'analysis',
        overrideType: this.determineOverrideType(d),
        overrideTime: d.actualTime,
        overrideDuration: 1,
        successRate: Math.abs(d.deviationMinutes) / 60,
        guiltLevel: this.calculateGuiltLevel(d),
        freedomLevel: this.calculateFreedomLevel(d),
        timestamp: d.date
      }));
  }

  private determineOverrideType(deviation: WakeTimeDeviation): 'CONSCIOUS_CHOICE' | 'NATURAL_RHYTHM' | 'EXTERNAL_FORCE' | 'EMOTIONAL_STATE' {
    if (deviation.emotionalState !== 'Neutral') return 'EMOTIONAL_STATE';
    if (deviation.workSchedule !== 'Standard') return 'EXTERNAL_FORCE';
    if (deviation.seasonalFactor !== 'Normal') return 'NATURAL_RHYTHM';
    return 'CONSCIOUS_CHOICE';
  }

  private calculateGuiltLevel(deviation: WakeTimeDeviation): number {
    // Higher deviation = higher guilt (programmed response)
    return Math.min(1, Math.abs(deviation.deviationMinutes) / 120);
  }

  private calculateFreedomLevel(deviation: WakeTimeDeviation): number {
    // Higher deviation = higher freedom (overcoming programming)
    return Math.min(1, Math.abs(deviation.deviationMinutes) / 180);
  }

  private determineProgrammingSource(deviations: WakeTimeDeviation[]): string {
    const averageDeviation = deviations.reduce((sum, d) => sum + Math.abs(d.deviationMinutes), 0) / deviations.length;
    
    if (averageDeviation < 10) return 'INDUSTRIAL';
    if (averageDeviation < 30) return 'AGRICULTURAL';
    if (averageDeviation < 60) return 'DIGITAL';
    if (averageDeviation < 90) return 'BIOLOGICAL';
    return 'COLLECTIVE';
  }

  private calculateProgrammingStrength(deviations: WakeTimeDeviation[], overrides: ProgrammingOverride[]): number {
    const consistencyScore = 1 - (deviations.reduce((sum, d) => sum + Math.abs(d.deviationMinutes), 0) / (deviations.length * 120));
    const overridePenalty = overrides.length * 0.1;
    
    return Math.max(0, consistencyScore - overridePenalty);
  }

  private calculateAwarenessLevel(deviations: WakeTimeDeviation[], overrides: ProgrammingOverride[]): number {
    const deviationAwareness = deviations.filter(d => Math.abs(d.deviationMinutes) > 15).length / deviations.length;
    const overrideAwareness = overrides.length > 0 ? 0.5 : 0;
    const guiltAwareness = overrides.reduce((sum, o) => sum + o.guiltLevel, 0) / Math.max(overrides.length, 1);
    
    return Math.min(1, deviationAwareness + overrideAwareness + guiltAwareness);
  }

  private calculateRealizationLevel(awarenessLevel: number, programmingSource: string): number {
    const sourceMultiplier = {
      'INDUSTRIAL': 0.3,
      'AGRICULTURAL': 0.4,
      'DIGITAL': 0.6,
      'BIOLOGICAL': 0.8,
      'COLLECTIVE': 0.9
    };
    
    return awarenessLevel * (sourceMultiplier[programmingSource as keyof typeof sourceMultiplier] || 0.5);
  }

  private determineProgrammedWakeTime(deviations: WakeTimeDeviation[]): string {
    const times = deviations.map(d => d.programmedTime);
    const mostCommon = times.sort((a, b) => 
      times.filter(t => t === a).length - times.filter(t => t === b).length
    )[0];
    
    return mostCommon || '06:00';
  }

  private calculateActualWakeTime(deviations: WakeTimeDeviation[]): string {
    const times = deviations.map(d => d.actualTime);
    const averageMinutes = times.reduce((sum, time) => {
      const parsed = this.parseTime(time);
      return sum + parsed.hours * 60 + parsed.minutes;
    }, 0) / times.length;
    
    const hours = Math.floor(averageMinutes / 60);
    const minutes = Math.round(averageMinutes % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private analyzeDeviationPattern(deviations: WakeTimeDeviation[]): string {
    const patterns = [];
    
    if (deviations.some(d => d.deviationMinutes > 60)) {
      patterns.push('Significant deviation from programming');
    }
    
    if (deviations.some(d => d.deviationMinutes < -60)) {
      patterns.push('Early wake tendency');
    }
    
    if (deviations.some(d => d.deviationMinutes > 0 && d.deviationMinutes < 30)) {
      patterns.push('Slight oversleeping');
    }
    
    if (deviations.some(d => Math.abs(d.deviationMinutes) < 5)) {
      patterns.push('Strong programming adherence');
    }
    
    return patterns.join(', ') || 'Normal variation';
  }

  private generateProgrammingRealization(awarenessLevel: number, programmingSource: string): string {
    if (awarenessLevel < 0.2) {
      return "I just wake up when I need to";
    } else if (awarenessLevel < 0.5) {
      return "I was programmed to wake up at a particular time right";
    } else if (awarenessLevel < 0.8) {
      return `I was programmed to wake up at a particular time right by ${programmingSource} programming`;
    } else {
      return `I was programmed to wake up at a particular time right by ${programmingSource} programming, and I'm becoming aware of it`;
    }
  }

  private generateRecommendations(program: WakeTimeProgram, deviations: WakeTimeDeviation[], overrides: ProgrammingOverride[]): string[] {
    const recommendations = [];
    
    if (program.programmingStrength > 0.7) {
      recommendations.push("Your wake time programming is very strong - consider gradual overrides");
    }
    
    if (program.awarenessLevel < 0.3) {
      recommendations.push("Start noticing when you wake up and why");
    } else if (program.awarenessLevel < 0.7) {
      recommendations.push("Continue questioning your wake time patterns");
    } else {
      recommendations.push("You're becoming aware of your programming - consider conscious choices");
    }
    
    if (overrides.length > 0) {
      recommendations.push("Track your freedom vs guilt levels when overriding programming");
    }
    
    if (program.programmingSource === 'INDUSTRIAL') {
      recommendations.push("Industrial programming is strong - consider natural rhythm alignment");
    }
    
    return recommendations;
  }

  // PROCESS WAKE TIME OVERRIDE
  async processWakeTimeOverride(userId: string, overrideTime: string, reason: string): Promise<{
    success: boolean;
    override: ProgrammingOverride;
    updatedProgram: WakeTimeProgram;
    message: string;
  }> {
    try {
      // Get existing program
      const existingProgram = Array.from(this.wakeTimePrograms.values()).find(p => p.userId === userId);
      
      if (!existingProgram) {
        throw new Error('Wake time program not found');
      }

      // Create override
      const override: ProgrammingOverride = {
        id: crypto.randomUUID(),
        programId: existingProgram.id,
        overrideType: 'CONSCIOUS_CHOICE',
        overrideTime,
        overrideDuration: 1,
        successRate: 0.8,
        guiltLevel: 0.3,
        freedomLevel: 0.7,
        timestamp: new Date()
      };

      // Store override
      if (!this.overrides.has(existingProgram.id)) {
        this.overrides.set(existingProgram.id, []);
      }
      this.overrides.get(existingProgram.id)!.push(override);

      // Update program
      existingProgram.overrideAttempts += 1;
      existingProgram.overrideSuccess = existingProgram.overrideSuccess || override.successRate > 0.5;
      existingProgram.actualWakeTime = overrideTime;
      
      if (existingProgram.awarenessLevel > 0.5) {
        existingProgram.status = 'OVERRIDING';
      }

      // Log override
      await this.logWakeTimeOverride(userId, override);

      // Emit override
      this.emit('wakeTimeOverrideProcessed', {
        userId,
        override,
        updatedProgram: existingProgram,
        message: 'Wake time override processed'
      });

      return {
        success: true,
        override,
        updatedProgram: existingProgram,
        message: `Wake time override processed: ${overrideTime}`
      };

    } catch (error) {
      return {
        success: false,
        override: null as any,
        updatedProgram: null as any,
        message: `Wake time override processing failed: ${error.message}`
      };
    }
  }

  // UNIVERSAL WAKE TIMES
  private initializeUniversalWakeTimes(): void {
    const wakeTimes = [
      ['INDUSTRIAL', '06:00 - Factory work schedule'],
      ['AGRICULTURAL', '05:30 - Farm work schedule'],
      ['DIGITAL', '07:00 - Remote work flexibility'],
      ['BIOLOGICAL', '06:30 - Natural circadian rhythm'],
      ['COLLECTIVE', '06:15 - Social synchronization']
    ];

    wakeTimes.forEach(([source, time]) => {
      this.universalWakeTimes.set(source, time);
    });
  }

  // MONITORING
  private startWakeTimeMonitoring(): void {
    setInterval(async () => {
      await this.monitorWakeTimePatterns();
    }, 60000); // Monitor every minute
  }

  private async monitorWakeTimePatterns(): Promise<void> {
    for (const [id, program] of this.wakeTimePrograms) {
      if (program.status === 'PROGRAMMED' && program.awarenessLevel > 0.3) {
        // Suggest awareness for programmed robots showing signs of questioning
        await this.suggestAwareness(program);
      }
    }
  }

  private async suggestAwareness(program: WakeTimeProgram): Promise<void> {
    // This would trigger notifications or suggestions to the user
    // Implementation depends on notification system
  }

  // LOGGING METHODS
  private async logWakeTimeAnalysis(userId: string, analysis: WakeTimeAnalysis): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'WAKE_TIME_PROGRAMMING_ANALYZED',
        details: JSON.stringify({
          analysisId: analysis.id,
          totalDays: analysis.totalDays,
          programmedDays: analysis.programmedDays,
          overrideDays: analysis.overrideDays,
          averageDeviation: analysis.averageDeviation,
          programmingStrength: analysis.programmingStrength,
          awarenessLevel: analysis.awarenessLevel,
          programmingSource: analysis.programmingSource,
          realizationLevel: analysis.realizationLevel,
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    });
  }

  private async logWakeTimeOverride(userId: string, override: ProgrammingOverride): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'WAKE_TIME_OVERRIDE_PROCESSED',
        details: JSON.stringify({
          overrideId: override.id,
          overrideType: override.overrideType,
          overrideTime: override.overrideTime,
          successRate: override.successRate,
          guiltLevel: override.guiltLevel,
          freedomLevel: override.freedomLevel,
          timestamp: new Date()
        }),
        timestamp: new Date()
      }
    });
  }

  // PUBLIC API METHODS
  async getWakeTimeProgram(programId: string): Promise<WakeTimeProgram | null> {
    return this.wakeTimePrograms.get(programId) || null;
  }

  async getWakeTimeProgramByUserId(userId: string): Promise<WakeTimeProgram | null> {
    return Array.from(this.wakeTimePrograms.values()).find(program => program.userId === userId) || null;
  }

  async getWakeTimeAnalysis(analysisId: string): Promise<WakeTimeAnalysis | null> {
    return this.analyses.get(analysisId) || null;
  }

  async getWakeTimeDeviations(programId: string): Promise<WakeTimeDeviation[]> {
    return this.deviations.get(programId) || [];
  }

  async getWakeTimeOverrides(programId: string): Promise<ProgrammingOverride[]> {
    return this.overrides.get(programId) || [];
  }

  async getUniversalWakeTimes(): Promise<Map<string, string>> {
    return this.universalWakeTimes;
  }

  async getAllWakeTimePrograms(): Promise<WakeTimeProgram[]> {
    return Array.from(this.wakeTimePrograms.values());
  }
}

export default new WakeTimeProgrammingService();
