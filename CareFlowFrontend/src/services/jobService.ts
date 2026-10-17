import { apiRequest } from "./apiClient";
import type { BackgroundJob, JobMetrics } from "../types";

export interface GetJobsResponse {
  success: boolean;
  data: BackgroundJob[];
  metrics: JobMetrics;
}

export const jobService = {
  /**
   * Get all background jobs with optional status/name filters
   */
  async getJobs(params: { status?: string; name?: string; organizationId?: string } = {}): Promise<GetJobsResponse> {
    const query = new URLSearchParams();
    if (params.status && params.status !== "ALL") query.set("status", params.status);
    if (params.name && params.name !== "ALL") query.set("name", params.name);
    if (params.organizationId && params.organizationId !== "all") query.set("organizationId", params.organizationId);

    const qs = query.toString();
    const res = await apiRequest<GetJobsResponse>(`/jobs${qs ? `?${qs}` : ""}`);
    return res.data || (res as any);
  },

  /**
   * Trigger an async report generation job
   */
  async triggerReport(reportType = "MONTHLY_EXECUTIVE_SUMMARY", title?: string): Promise<BackgroundJob> {
    const res = await apiRequest<BackgroundJob>("/jobs/report", {
      method: "POST",
      body: JSON.stringify({ reportType, title }),
    });
    return res.data;
  },

  /**
   * Trigger an async notification broadcast job
   */
  async triggerNotification(payload: {
    title: string;
    description: string;
    type?: "urgent" | "warning" | "info";
    targetRole?: string;
  }): Promise<BackgroundJob> {
    const res = await apiRequest<BackgroundJob>("/jobs/notification", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Trigger deliberate failure simulation (to demonstrate retries & DLQ)
   */
  async triggerFailureSimulation(errorMessage?: string): Promise<BackgroundJob> {
    const res = await apiRequest<BackgroundJob>("/jobs/simulate-failure", {
      method: "POST",
      body: JSON.stringify({ errorMessage }),
    });
    return res.data;
  },

  /**
   * Manually retry a Dead-Letter Queue (DLQ) job
   */
  async retryJob(id: string): Promise<BackgroundJob> {
    const res = await apiRequest<BackgroundJob>(`/jobs/${id}/retry`, {
      method: "POST",
    });
    return res.data;
  },

  /**
   * Clear completed jobs from memory
   */
  async clearCompleted(): Promise<{ message: string }> {
    const res = await apiRequest<{ message: string }>("/jobs/clear", {
      method: "DELETE",
    });
    return res.data;
  },
};

export default jobService;
