/**
 * Clinical & Operational AI Service
 * HIPAA de-identified summarization and live database-grounded operational assistance
 */

import { apiRequest } from "./apiClient.js";
import type { ClinicalSummaryResult, OperationalCopilotResult } from "../types/index.js";

export interface SummarizeEncounterPayload {
  patientName?: string;
  mrn?: string;
  phone?: string;
  chiefComplaint?: string;
  subjectiveNotes?: string;
  objectiveFindings?: string;
  assessment?: string;
  plan?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    spO2?: number;
    respiratoryRate?: number;
    temperature?: number;
  };
}

export interface LabTrendEvaluationResult {
  testName: string;
  overallStatus: "CRITICAL" | "ABNORMAL" | "NORMAL";
  criticalFindings: string[];
  clinicalImpression: string;
  followUpActions: string[];
  disclaimer: string;
  evaluatedAt: string;
}

export const aiService = {
  /**
   * Request HIPAA-scrubbed SOAP clinical summarization with ICD-10 suggestions
   */
  async summarizeEncounter(payload: SummarizeEncounterPayload): Promise<ClinicalSummaryResult> {
    const response = await apiRequest<ClinicalSummaryResult>("/ai/summarize-encounter", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  /**
   * Query the live database-grounded operational copilot (bed occupancy, queues, inventory, receivables)
   */
  async queryOperationalAssistant(query: string): Promise<OperationalCopilotResult> {
    const response = await apiRequest<OperationalCopilotResult>("/ai/operational-assistant", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    return response.data;
  },

  /**
   * Biochemical and hematological parameter evaluation
   */
  async evaluateLabTrends(testName: string, results: any[]): Promise<LabTrendEvaluationResult> {
    const response = await apiRequest<LabTrendEvaluationResult>("/ai/evaluate-lab", {
      method: "POST",
      body: JSON.stringify({ testName, results }),
    });
    return response.data;
  },
};

export default aiService;
