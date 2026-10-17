/**
 * Centralized API Client for CareFlow Frontend
 * Connects to the Express + TypeScript REST API with intelligent offline/development fallback.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:5000/api/v1"
    : "/api/v1");

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message: string;
    statusCode: number;
    code: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Make an HTTP request to the CareFlow backend.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const token = localStorage.getItem("careflow_token");
  const tenantId = localStorage.getItem("careflow_tenant_id");

  const defaultHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantId ? { "x-organization-id": tenantId } : {}),
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    const result: ApiResponse<T> = await response.json();

    if (!response.ok || !result.success) {
      throw new ApiError(
        result.error?.message || result.message || `Request failed with status ${response.status}`,
        response.status,
        result.error?.code,
        result.error?.details
      );
    }

    return result;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors (e.g. server offline or CORS failed)
    throw new ApiError(
      error.message || "Failed to communicate with CareFlow API server.",
      0,
      "NETWORK_ERROR"
    );
  }
}

export default apiRequest;
