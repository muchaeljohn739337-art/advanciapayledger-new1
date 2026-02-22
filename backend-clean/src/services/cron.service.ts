/**
 * Cron Service - Advancia Pay Ledger
 * 
 * Scheduled tasks and background jobs
 */

import cron, { type ScheduledTask } from 'node-cron';

export class CronService {
  private jobs: Map<string, ScheduledTask> = new Map();

  constructor() {
    console.log('[CRON] Cron service initialized');
  }

  /**
   * Start all cron jobs
   */
  startAll(): void {
    console.log('[CRON] Starting all cron jobs...');
    
    // Add cron jobs here as needed
    console.log('[CRON] All cron services started successfully');
  }

  /**
   * Stop all cron jobs
   */
  stopAll(): void {
    console.log('[CRON] Stopping all cron jobs...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`[CRON] Stopped job: ${name}`);
    });
    
    this.jobs.clear();
    console.log('[CRON] All cron jobs stopped');
  }

  /**
   * Add a new cron job
   */
  addJob(name: string, schedule: string, callback: () => Promise<void>): void {
    if (this.jobs.has(name)) {
      console.log(`[CRON] Job ${name} already exists, stopping it first`);
      this.jobs.get(name)?.stop();
    }

    const job = cron.schedule(schedule, async () => {
      console.log(`[CRON] Running job: ${name}`);
      try {
        await callback();
      } catch (error) {
        console.error(`[CRON] Job ${name} failed:`, error);
      }
    });

    this.jobs.set(name, job);
    console.log(`[CRON] Added job: ${name} with schedule: ${schedule}`);
  }

  /**
   * Remove a cron job
   */
  removeJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`[CRON] Removed job: ${name}`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(): Array<{ name: string; running: boolean }> {
    return Array.from(this.jobs.entries()).map(([name, job]) => ({
      name,
      running: Boolean((job as any).running ?? true)
    }));
  }
}

export const cronService = new CronService();
export default cronService;
