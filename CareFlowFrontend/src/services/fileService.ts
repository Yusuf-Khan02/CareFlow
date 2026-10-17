/**
 * Medical File Management Service
 * HIPAA-compliant private document vault operations
 */

import { apiRequest } from "./apiClient.js";
import type { MedicalFile, FileStorageMetrics } from "../types/index.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export interface ListFilesParams {
  patientId?: number;
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface UploadFilePayload {
  file: File;
  category: string;
  patientId?: number;
  consultationId?: string;
  labOrderId?: string;
  description?: string;
}

export interface SignedUrlResponse {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  downloadUrl: string;
  token: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export const fileService = {
  /**
   * List files matching query filters
   */
  async getFiles(params: ListFilesParams = {}): Promise<{ files: MedicalFile[]; total: number }> {
    const query = new URLSearchParams();
    if (params.patientId) query.append("patientId", String(params.patientId));
    if (params.category && params.category !== "ALL") query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    if (params.limit) query.append("limit", String(params.limit));
    if (params.offset) query.append("offset", String(params.offset));

    const qs = query.toString();
    const endpoint = `/files${qs ? `?${qs}` : ""}`;
    const response = await apiRequest<MedicalFile[]>(endpoint);
    return {
      files: response.data || [],
      total: (response as any).total ?? response.data?.length ?? 0,
    };
  },

  /**
   * Get storage breakdown and capacity metrics
   */
  async getStorageMetrics(): Promise<FileStorageMetrics> {
    const response = await apiRequest<FileStorageMetrics>("/files/metrics");
    return response.data;
  },

  /**
   * Upload a file into the private medical storage
   */
  async uploadFile(payload: UploadFilePayload): Promise<MedicalFile> {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("category", payload.category);
    if (payload.patientId) formData.append("patientId", String(payload.patientId));
    if (payload.consultationId) formData.append("consultationId", payload.consultationId);
    if (payload.labOrderId) formData.append("labOrderId", payload.labOrderId);
    if (payload.description) formData.append("description", payload.description);

    const response = await apiRequest<MedicalFile>("/files/upload", {
      method: "POST",
      body: formData,
    });
    return response.data;
  },

  /**
   * Generate short-lived cryptographic signed download URL
   */
  async getSignedUrl(fileId: string): Promise<SignedUrlResponse> {
    const response = await apiRequest<SignedUrlResponse>(`/files/${fileId}/signed-url`);
    return response.data;
  },

  /**
   * Download file using signed token
   */
  async downloadWithToken(token: string, originalName: string, inNewTab: boolean = false): Promise<void> {
    const downloadUrl = `${API_BASE_URL}/files/download/${token}`;
    if (inNewTab) {
      window.open(downloadUrl, "_blank");
      return;
    }

    try {
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = originalName || "medical-document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback to window navigation
      window.open(downloadUrl, "_blank");
    }
  },

  /**
   * Delete a file from private storage
   */
  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success: boolean; message: string }>(`/files/${fileId}`, {
      method: "DELETE",
    });
    return response.data || { success: true, message: response.message || "File deleted successfully" };
  },
};

export default fileService;
