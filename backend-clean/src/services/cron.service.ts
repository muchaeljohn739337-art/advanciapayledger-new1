/**
 * Cron Service - Advancia Pay Ledger
 * 
 * Scheduled tasks and background jobs
 */

import cron, { type ScheduledTask } from 'node-cron';
import { logger } from "../lib/logger";

export class CronService {
  private jobs: Map<string, ScheduledTask> = new Map();

  constructor() {
    logger.info('[CRON] Cron service initialized');
  }

  /**
   * Start all cron jobs
   */
  startAll(): void {
    logger.info('[CRON] Starting all cron jobs...');
    
    // Add cron jobs here as needed
    logger.info('[CRON] All cron services started successfully');
  }

  /**
   * Stop all cron jobs
   */
  stopAll(): void {
    logger.info('[CRON] Stopping all cron jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`[CRON] Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    logger.info('[CRON] All cron jobs stopped');
  }

  /**
   * Add a new cron job
   */
  addJob(name: string, schedule: string, callback: () => Promise<void>): void {
    if (!cron.validate(schedule)) {
      throw new Error(`[CRON] Invalid cron expression for job "${name}": ${schedule}`);
    }

    if (this.jobs.has(name)) {
      logger.info(`[CRON] Job ${name} already exists, stopping it first`);
      this.jobs.get(name)?.stop();
    }

    const job = cron.schedule(schedule, async () => {
      logger.info(`[CRON] Running job: ${name}`);
      try {
        await callback();
      } catch (error) {
        logger.error(`[CRON] Job ${name} failed:`, error);
      }
    });

    this.jobs.set(name, job);
    logger.info(`[CRON] Added job: ${name} with schedule: ${schedule}`);
  }

  /**
   * Remove a cron job
   */
  removeJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`[CRON] Removed job: ${name}`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(): Array<{ name: string; running: boolean }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: Boolean((job as any).running ?? false)
    }));
  }
}

export const cronService = new CronService();
export default cronService;
