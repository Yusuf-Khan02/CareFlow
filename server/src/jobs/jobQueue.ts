import crypto from "crypto";
import logger from "../utils/logger.js";
import { broadcastJobEvent, broadcastNotification } from "../realtime/socketService.js";

export type JobStatus = "waiting" | "active" | "completed" | "failed" | "dead_letter";

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  status: JobStatus;
  progress: number;
  attempts: number;
  maxAttempts: number;
  backoffMs: number;
  error?: string | null;
  result?: any;
  organizationId: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export type JobProcessor<T = any> = (
  job: Job<T>,
  updateProgress: (percent: number) => void
) => Promise<any>;

class JobQueueManager {
  private jobs: Map<string, Job> = new Map();
  private processors: Map<string, JobProcessor> = new Map();
  private isProcessing = false;

  constructor() {
    this.registerDefaultWorkers();
  }

  /**
   * Register a processor for a named job type
   */
  public registerWorker<T = any>(name: string, processor: JobProcessor<T>) {
    this.processors.set(name, processor);
    logger.info(`[JobQueue] Registered worker for job type: ${name}`);
  }

  /**
   * Add a new job to the queue
   */
  public async add<T = any>(
    name: string,
    data: T,
    options: {
      id?: string;
      organizationId?: string;
      maxAttempts?: number;
      backoffMs?: number;
    } = {}
  ): Promise<Job<T>> {
    const id = options.id || crypto.randomUUID();

    // Idempotency check: if job ID already exists and is active/waiting, return existing
    if (this.jobs.has(id)) {
      const existing = this.jobs.get(id)!;
      if (existing.status === "waiting" || existing.status === "active") {
        logger.info(`[JobQueue] Idempotent hit: Job ${id} already in progress.`);
        return existing as Job<T>;
      }
    }

    const job: Job<T> = {
      id,
      name,
      data,
      status: "waiting",
      progress: 0,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      backoffMs: options.backoffMs ?? 1000,
      organizationId: options.organizationId || "org-careflow-central",
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(id, job);
    logger.info(`[JobQueue] Enqueued job ${id} [${name}] for tenant: ${job.organizationId}`);
    broadcastJobEvent("job:created", job);

    // Trigger queue worker loop
    this.processNext();

    return job;
  }

  /**
   * Process pending jobs in background
   */
  private async processNext() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const waitingJob = Array.from(this.jobs.values()).find((j) => j.status === "waiting");
      if (!waitingJob) {
        this.isProcessing = false;
        return;
      }

      await this.executeJob(waitingJob);
    } catch (err: any) {
      logger.error(`[JobQueue] Worker loop error: ${err.message}`);
    } finally {
      this.isProcessing = false;
      // If there are more waiting jobs, continue
      const hasMore = Array.from(this.jobs.values()).some((j) => j.status === "waiting");
      if (hasMore) {
        setImmediate(() => this.processNext());
      }
    }
  }

  /**
   * Execute an individual job with progress streaming, retries, and DLQ handling
   */
  private async executeJob(job: Job) {
    const processor = this.processors.get(job.name);
    if (!processor) {
      job.status = "failed";
      job.error = `No worker registered for job type '${job.name}'`;
      broadcastJobEvent("job:failed", job);
      return;
    }

    job.status = "active";
    job.startedAt = new Date().toISOString();
    job.attempts += 1;
    broadcastJobEvent("job:progress", job);

    const updateProgress = (percent: number) => {
      job.progress = Math.min(100, Math.max(0, percent));
      broadcastJobEvent("job:progress", job);
    };

    try {
      logger.info(`[JobQueue] Executing ${job.name} (#${job.id}), Attempt ${job.attempts}/${job.maxAttempts}`);
      const result = await processor(job, updateProgress);

      job.status = "completed";
      job.progress = 100;
      job.result = result;
      job.completedAt = new Date().toISOString();
      job.error = null;

      logger.info(`[JobQueue] Job ${job.id} (${job.name}) completed successfully.`);
      broadcastJobEvent("job:completed", job);
    } catch (err: any) {
      job.error = err.message || "Unknown execution error";
      logger.warn(`[JobQueue] Job ${job.id} failed attempt ${job.attempts}: ${job.error}`);

      if (job.attempts < job.maxAttempts) {
        job.status = "waiting";
        const delay = job.backoffMs * Math.pow(2, job.attempts - 1);
        logger.info(`[JobQueue] Job ${job.id} will retry in ${delay}ms`);
        broadcastJobEvent("job:progress", job);

        setTimeout(() => {
          this.processNext();
        }, delay);
      } else {
        // Permanently failed -> Move to Dead-Letter Queue (DLQ)
        job.status = "dead_letter";
        job.completedAt = new Date().toISOString();
        logger.error(`[JobQueue] Job ${job.id} permanently failed after ${job.attempts} attempts. Moved to DEAD-LETTER QUEUE (DLQ).`);
        broadcastJobEvent("job:dead_letter", job);
      }
    }
  }

  /**
   * Manually retry a Dead-Letter Queue (DLQ) job
   */
  public retryJob(id: string): Job | null {
    const job = this.jobs.get(id);
    if (!job) return null;

    if (job.status === "dead_letter" || job.status === "failed") {
      job.status = "waiting";
      job.attempts = 0; // reset attempts for manual retry
      job.progress = 0;
      job.error = null;
      logger.info(`[JobQueue] Manually retrying Dead-Letter Job: ${id} (${job.name})`);
      broadcastJobEvent("job:created", job);
      this.processNext();
      return job;
    }

    return job;
  }

  /**
   * Get all jobs
   */
  public listJobs(filter?: { status?: JobStatus; name?: string; organizationId?: string }): Job[] {
    let list = Array.from(this.jobs.values());
    if (filter?.status) {
      list = list.filter((j) => j.status === filter.status);
    }
    if (filter?.name) {
      list = list.filter((j) => j.name === filter.name);
    }
    if (filter?.organizationId && filter.organizationId !== "all") {
      list = list.filter((j) => j.organizationId === filter.organizationId);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Get metrics summary
   */
  public getMetrics(organizationId?: string) {
    const all = this.listJobs({ organizationId });
    return {
      total: all.length,
      waiting: all.filter((j) => j.status === "waiting").length,
      active: all.filter((j) => j.status === "active").length,
      completed: all.filter((j) => j.status === "completed").length,
      failed: all.filter((j) => j.status === "failed").length,
      deadLetter: all.filter((j) => j.status === "dead_letter").length,
    };
  }

  /**
   * Clear completed jobs
   */
  public clearCompleted() {
    let count = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === "completed") {
        this.jobs.delete(id);
        count++;
      }
    }
    return count;
  }

  // ==========================================================================
  // DEFAULT BACKGROUND WORKERS (PHASE 14)
  // ==========================================================================
  private registerDefaultWorkers() {
    /**
     * 1. Asynchronous Report Generation Worker
     */
    this.registerWorker("report-generation", async (job, updateProgress) => {
      updateProgress(10);
      await new Promise((r) => setTimeout(r, 600));

      updateProgress(35);
      await new Promise((r) => setTimeout(r, 800));

      updateProgress(70);
      await new Promise((r) => setTimeout(r, 600));

      updateProgress(90);
      await new Promise((r) => setTimeout(r, 400));

      const reportPayload = {
        title: job.data?.title || "CareFlow Executive Operational Report",
        reportType: job.data?.reportType || "MONTHLY_EXECUTIVE_SUMMARY",
        organizationId: job.organizationId,
        generatedAt: new Date().toISOString(),
        metrics: {
          totalEncounters: 142,
          bedOccupancyRate: "82.4%",
          averageQueueWaitMinutes: 14.8,
          grossInvoiced: "$48,920.00",
          collectedRevenue: "$41,200.00",
          pharmacyStockHealth: "94.2%",
          criticalLabIncidents: 0,
        },
        downloadUrl: `/api/v1/billing/export`,
      };

      // Broadcast notification of report completion
      broadcastNotification(job.organizationId, {
        id: crypto.randomUUID(),
        title: "Report Generation Complete",
        description: `Your ${reportPayload.title} has finished compiling and is ready.`,
        type: "info",
      });

      return reportPayload;
    });

    /**
     * 2. Asynchronous Notification Delivery Worker
     */
    this.registerWorker("notification-delivery", async (job, updateProgress) => {
      updateProgress(20);
      await new Promise((r) => setTimeout(r, 300));

      updateProgress(60);
      await new Promise((r) => setTimeout(r, 400));

      const notif = {
        id: crypto.randomUUID(),
        title: job.data?.title || "Clinical Alert",
        description: job.data?.description || "High priority operational update dispatched to all on-duty staff.",
        type: (job.data?.type || "warning") as "urgent" | "warning" | "info",
        targetRole: job.data?.targetRole,
        targetUserId: job.data?.targetUserId,
      };

      broadcastNotification(job.organizationId, notif);
      updateProgress(100);

      return {
        dispatched: true,
        notification: notif,
        recipientCount: 8,
        dispatchedAt: new Date().toISOString(),
      };
    });

    /**
     * 3. Dead-Letter Queue (DLQ) Simulation Worker
     * Fails deliberately on early attempts to demonstrate retries and DLQ placement
     */
    this.registerWorker("dlq-simulation-test", async (job, updateProgress) => {
      updateProgress(25);
      await new Promise((r) => setTimeout(r, 400));

      if (job.data?.shouldSucceedOnRetry && job.attempts >= 3) {
        updateProgress(100);
        return { message: "Recovered successfully on retry attempt 3" };
      }

      // Always fail to demonstrate DLQ
      throw new Error(
        job.data?.errorMessage ||
          "Simulated External SMS Gateway Timeout (HTTP 504 Gateway Timeout)"
      );
    });
  }
}

// Global Singleton
export const jobQueue = new JobQueueManager();
export default jobQueue;
