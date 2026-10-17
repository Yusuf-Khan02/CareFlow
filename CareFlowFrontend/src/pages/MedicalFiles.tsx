import React, { useState, useEffect, useCallback } from "react";
import { useTenant } from "../context/TenantContext";
import { fileService } from "../services/fileService";
import { aiService } from "../services/aiService";
import { patientService } from "../services/patientService";
import type {
  MedicalFile,
  FileStorageMetrics,
  ClinicalSummaryResult,
  OperationalCopilotResult,
  Patient,
} from "../types";
import {
  FileText,
  Download,
  Upload,
  Trash2,
  Eye,
  Search,
  Shield,
  Sparkles,
  Bot,
  Lock,
  HardDrive,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Activity,
  HeartPulse,
  Building2,
  X,
  FileSpreadsheet,
} from "../components/common/Icons";
import { useToast, Spinner, ConfirmationDialog } from "../components/common";
import "./MedicalFiles.css";

const CATEGORIES: Array<{ key: string; label: string; color: string }> = [
  { key: "ALL", label: "All Documents", color: "#64748b" },
  { key: "Radiology", label: "Radiology & Imaging", color: "#8b5cf6" },
  { key: "LabReport", label: "Lab Reports", color: "#3b82f6" },
  { key: "DischargeSummary", label: "Discharge Summaries", color: "#10b981" },
  { key: "Prescription", label: "Prescriptions", color: "#f59e0b" },
  { key: "Insurance", label: "Insurance & ID", color: "#ec4899" },
  { key: "Other", label: "General & Other", color: "#6b7280" },
];

const PRESETS = [
  {
    label: "NSTEMI / Acute Coronary",
    data: {
      patientName: "Robert Vance",
      mrn: "MRN-90214",
      phone: "+1-555-019-8234",
      chiefComplaint: "Substernal chest pressure radiating to left arm for 3 hours, diaphoresis",
      subjectiveNotes: "Patient reports sudden onset of 8/10 pressure-like chest discomfort while at rest. Associated with shortness of breath and nausea. No prior history of CAD.",
      objectiveFindings: "Diaphoretic, uncomfortable. S1/S2 regular, no murmurs. Lungs clear bilaterally. Initial Troponin I elevated at 0.85 ng/mL. EKG shows T-wave inversion in V4-V6.",
      assessment: "Acute Coronary Syndrome, concerning for NSTEMI. Hypertensive urgency.",
      plan: "Admit to Cardiac ICU. Initiate Aspirin 325mg PO, Heparin drip per protocol, Clopidogrel 300mg load. Urgent cardiology consult for catheterization.",
      vitals: { bloodPressure: "168/98", heartRate: 104, spO2: 95, respiratoryRate: 22, temperature: 37.1 },
    },
  },
  {
    label: "Type 2 DKA Routine",
    data: {
      patientName: "Elena Rostova",
      mrn: "MRN-44821",
      phone: "+1-555-014-9912",
      chiefComplaint: "Nausea, intractable vomiting, and severe dehydration for 24 hours",
      subjectiveNotes: "Patient with known T2D reports running out of insulin 3 days ago. Developed progressive polyuria, polydipsia, and weakness.",
      objectiveFindings: "Dry mucous membranes, Kussmaul respirations, fruity breath odor. Point-of-care glucose 445 mg/dL. Urinalysis shows 4+ ketones. Serum bicarbonate 12 mEq/L, anion gap 24.",
      assessment: "Diabetic Ketoacidosis secondary to insulin non-compliance. Severe dehydration with metabolic acidosis.",
      plan: "Isotonic saline 1L/hr IV. Regular insulin continuous infusion 0.1 units/kg/hr. Serial BMP and venous blood gas every 2 hours until anion gap closure.",
      vitals: { bloodPressure: "98/62", heartRate: 118, spO2: 98, respiratoryRate: 28, temperature: 36.8 },
    },
  },
  {
    label: "Bacterial Pneumonia",
    data: {
      patientName: "Harold Miller",
      mrn: "MRN-18239",
      phone: "+1-555-018-4721",
      chiefComplaint: "Productive cough with rust-colored sputum, high-grade fevers, pleuritic chest pain",
      subjectiveNotes: "Symptom onset 4 days ago with shivers and worsening breathlessness on exertion. No recent travel or sick contacts.",
      objectiveFindings: "Febrile, tachypneic. Auscultation reveals bronchial breath sounds and inspiratory crackles over right lower lobe. Chest X-Ray confirms dense right lower lobe consolidation.",
      assessment: "Community-Acquired Bacterial Pneumonia (CURB-65 score: 2).",
      plan: "Admit to General Medical Ward. Blood and sputum cultures drawn. Start Ceftriaxone 1g IV daily + Azithromycin 500mg PO daily. Supplemental oxygen via nasal cannula at 2L/min.",
      vitals: { bloodPressure: "124/78", heartRate: 98, spO2: 92, respiratoryRate: 24, temperature: 38.9 },
    },
  },
];

const formatReviewStatus = (status: string): string => {
  if (!status) return "Pending Verification";
  if (status === "PENDING_PHYSICIAN_VERIFICATION") {
    return "Pending Physician Verification";
  }
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const MedicalFiles: React.FC = () => {
  const { activeOrganization } = useTenant();
  const { showToast } = useToast();

  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<"vault" | "ai-copilot" | "operational">("vault");

  // Document Vault State
  const [files, setFiles] = useState<MedicalFile[]>([]);
  const [metrics, setMetrics] = useState<FileStorageMetrics>({
    totalFiles: 0,
    totalBytes: 0,
    totalMegaBytes: 0,
    byCategory: {},
  });
  const [loadingFiles, setLoadingFiles] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [previewFile, setPreviewFile] = useState<MedicalFile | null>(null);
  const [previewSignedUrl, setPreviewSignedUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload Form State
  const [uploadSelectedFile, setUploadSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>("Radiology");
  const [uploadPatientId, setUploadPatientId] = useState<string>("");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  // AI Copilot State
  const [copilotForm, setCopilotForm] = useState(PRESETS[0].data);
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);
  const [clinicalSummary, setClinicalSummary] = useState<ClinicalSummaryResult | null>(null);
  const [chartCopied, setChartCopied] = useState<boolean>(false);

  // Operational Assistant State
  const [opQuery, setOpQuery] = useState<string>("");
  const [queryingOp, setQueryingOp] = useState<boolean>(false);
  const [opResult, setOpResult] = useState<OperationalCopilotResult | null>(null);

  // Load files and metrics
  const loadFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const [filesRes, metricsRes] = await Promise.all([
        fileService.getFiles({
          category: selectedCategory !== "ALL" ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined,
        }),
        fileService.getStorageMetrics(),
      ]);
      setFiles(filesRes.files);
      setMetrics(metricsRes);
    } catch (err: any) {
      showToast(err.message || "Failed to load medical files", "error");
    } finally {
      setLoadingFiles(false);
    }
  }, [selectedCategory, searchQuery, showToast]);

  // Load patients for dropdown
  useEffect(() => {
    patientService.getPatients({ limit: 100 }).then((res) => {
      setPatients(res.patients || []);
    }).catch(() => {
      // Non-blocking
    });
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles, activeOrganization]);

  // Handle Download with short-lived signed token
  const handleDownload = async (file: MedicalFile) => {
    try {
      setDownloadingId(file.id);
      const signed = await fileService.getSignedUrl(file.id);
      await fileService.downloadWithToken(signed.token, signed.originalName);
      showToast(`Downloaded '${file.originalName}' with verified HMAC signature`, "success");
      // Refresh to update download count
      loadFiles();
    } catch (err: any) {
      showToast(err.message || "Failed to generate signed download token", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Preview
  const handleOpenPreview = async (file: MedicalFile) => {
    setPreviewFile(file);
    setPreviewLoading(true);
    try {
      const signed = await fileService.getSignedUrl(file.id);
      const fullUrl = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/files/download/${signed.token}`;
      setPreviewSignedUrl(fullUrl);
    } catch (err: any) {
      showToast(err.message || "Could not generate preview token", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewSignedUrl(null);
  };

  // Handle Deletion
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await fileService.deleteFile(deleteConfirmId);
      showToast("File permanently deleted from private clinical storage", "success");
      setDeleteConfirmId(null);
      loadFiles();
    } catch (err: any) {
      showToast(err.message || "Failed to delete file", "error");
    }
  };

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadSelectedFile) {
      showToast("Please choose a file to upload", "warning");
      return;
    }

    if (uploadSelectedFile.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB private storage limit", "error");
      return;
    }

    try {
      setUploading(true);
      await fileService.uploadFile({
        file: uploadSelectedFile,
        category: uploadCategory,
        patientId: uploadPatientId ? Number(uploadPatientId) : undefined,
        description: uploadDescription.trim() || undefined,
      });

      showToast(`Encrypted '${uploadSelectedFile.name}' stored with SHA-256 validation`, "success");
      setIsUploadOpen(false);
      setUploadSelectedFile(null);
      setUploadDescription("");
      setUploadPatientId("");
      loadFiles();
    } catch (err: any) {
      showToast(err.message || "File upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  // AI Copilot: Synthesize Clinical Summary
  const handleSynthesizeSummary = async () => {
    try {
      setGeneratingSummary(true);
      const res = await aiService.summarizeEncounter(copilotForm);
      setClinicalSummary(res);
      showToast("HIPAA scrubbed clinical documentation synthesized successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to summarize encounter", "error");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Copy Chart to Clipboard
  const handleCopyChart = () => {
    if (!clinicalSummary) return;
    const formatted = `
=========================================
CAREFLOW CLINICAL ENCOUNTER NOTE
${clinicalSummary.disclaimer}
Generated: ${clinicalSummary.generatedAt}
Model: ${clinicalSummary.model} (Confidence: ${Math.round(clinicalSummary.confidence * 100)}%)
=========================================

EXECUTIVE SUMMARY:
${clinicalSummary.executiveSummary}

PERTINENT FINDINGS:
${clinicalSummary.pertinentFindings.map((f) => `• ${f}`).join("\n")}

SUGGESTED ICD-10 DIAGNOSES:
${clinicalSummary.suggestedICD10.map((icd) => `[${icd.code}] ${icd.label}`).join("\n")}

CARE PLAN RECOMMENDATIONS:
${clinicalSummary.carePlanRecommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

CLINICAL CHRONOLOGY:
${clinicalSummary.clinicalChronology}

MEDICATION RECONCILIATION:
${clinicalSummary.medicationReconciliation}
`.trim();

    navigator.clipboard.writeText(formatted);
    setChartCopied(true);
    showToast("Full clinical chart copied to clipboard", "success");
    setTimeout(() => setChartCopied(false), 2500);
  };

  // Operational Assistant Query
  const handleQueryOperational = async (queryText?: string) => {
    const q = queryText || opQuery;
    if (!q.trim()) return;
    try {
      setQueryingOp(true);
      if (queryText) setOpQuery(queryText);
      const res = await aiService.queryOperationalAssistant(q);
      setOpResult(res);
      showToast("Live operational telemetry retrieved", "success");
    } catch (err: any) {
      showToast(err.message || "Operational assistant query failed", "error");
    } finally {
      setQueryingOp(false);
    }
  };

  // Copy SHA-256 Checksum
  const copyChecksum = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    showToast("SHA-256 Checksum copied", "info");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // File type icon helper
  const renderFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <Eye size={20} color="#8b5cf6" />;
    }
    if (mimeType.includes("pdf")) {
      return <FileText size={20} color="#ef4444" />;
    }
    if (mimeType.includes("sheet") || mimeType.includes("csv")) {
      return <FileSpreadsheet size={20} color="#10b981" />;
    }
    return <FileText size={20} color="#3b82f6" />;
  };

  return (
    <div className="medical-files-page">
      {/* Page Header */}
      <div className="files-header">
        <div className="files-header-info">
          <div className="header-badge">
            <Lock size={14} color="#10b981" />
            <span>HIPAA §164.312(b) Private Storage</span>
          </div>
          <h1>Medical Files & Clinical AI</h1>
          <p>
            Cryptographically sealed document vault, 15-minute signed token downloads, and HIPAA-scrubbed clinical AI assistance.
          </p>
        </div>
        <div className="files-header-actions">
          <button
            className="btn btn-secondary btn-icon"
            onClick={loadFiles}
            title="Refresh repository"
          >
            <RotateCcw size={16} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary btn-icon"
            onClick={() => setIsUploadOpen(true)}
          >
            <Upload size={16} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* KPI Storage Metrics Cards */}
      <div className="files-metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap" style={{ backgroundColor: "rgba(59, 130, 246, 0.12)" }}>
            <FileText size={24} color="#3b82f6" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Documents</span>
            <span className="metric-value">{metrics.totalFiles}</span>
            <span className="metric-subtext">Across {Object.keys(metrics.byCategory).length} categories</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap" style={{ backgroundColor: "rgba(16, 185, 129, 0.12)" }}>
            <HardDrive size={24} color="#10b981" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Encrypted Storage</span>
            <span className="metric-value">{metrics.totalMegaBytes} MB</span>
            <span className="metric-subtext">Private disk root isolation</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap" style={{ backgroundColor: "rgba(139, 92, 246, 0.12)" }}>
            <Shield size={24} color="#8b5cf6" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Radiology & Imaging</span>
            <span className="metric-value">{metrics.byCategory["Radiology"] || 0}</span>
            <span className="metric-subtext">X-Rays, DICOM & Sonography</span>
          </div>
        </div>

        <div className="metric-card glass-panel">
          <div className="metric-icon-wrap" style={{ backgroundColor: "rgba(245, 158, 11, 0.12)" }}>
            <Sparkles size={24} color="#f59e0b" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Clinical Intelligence</span>
            <span className="metric-value">Active</span>
            <span className="metric-subtext">SOAP engine & live copilot</span>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="tab-navigation-bar">
        <button
          className={`tab-btn ${activeTab === "vault" ? "active" : ""}`}
          onClick={() => setActiveTab("vault")}
        >
          <Lock size={16} />
          <span>Document Vault</span>
          <span className="tab-pill">{metrics.totalFiles}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "ai-copilot" ? "active" : ""}`}
          onClick={() => setActiveTab("ai-copilot")}
        >
          <Sparkles size={16} />
          <span>Clinical AI Copilot</span>
          <span className="tab-pill ai-pulse">SOAP</span>
        </button>

        <button
          className={`tab-btn ${activeTab === "operational" ? "active" : ""}`}
          onClick={() => setActiveTab("operational")}
        >
          <Bot size={16} />
          <span>Hospital Operational Assistant</span>
          <span className="tab-pill">Live DB</span>
        </button>
      </div>

      {/* TAB 1: DOCUMENT VAULT */}
      {activeTab === "vault" && (
        <div className="vault-view-container animate-fade-in">
          {/* Filters Bar */}
          <div className="vault-toolbar glass-panel">
            <div className="search-box">
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by filename, description, patient name, or MRN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-btn" onClick={() => setSearchQuery("")}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="category-pills-row">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-pill ${selectedCategory === cat.key ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.key)}
                >
                  <span className="pill-dot" style={{ backgroundColor: cat.color }} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Files List / Table */}
          {loadingFiles ? (
            <div className="loading-state glass-panel">
              <Spinner size="lg" />
              <p>Decrypting catalog & verifying private storage keys...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-files-state glass-panel">
              <FileText size={48} color="#64748b" />
              <h3>No Medical Documents Found</h3>
              <p>Upload patient imaging, lab reports, or discharge summaries with 256-bit encryption.</p>
              <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
                <Upload size={16} />
                <span>Upload First Document</span>
              </button>
            </div>
          ) : (
            <div className="files-table-container glass-panel">
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Category</th>
                    <th>Linked Patient</th>
                    <th>Integrity (SHA-256)</th>
                    <th>Size</th>
                    <th>Downloads</th>
                    <th>Uploaded</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="file-row">
                      {/* Document info */}
                      <td>
                        <div className="file-primary-cell">
                          <div className="file-icon-box">{renderFileIcon(file.mimeType)}</div>
                          <div className="file-name-meta">
                            <span className="file-name" title={file.originalName}>
                              {file.originalName}
                            </span>
                            {file.description && (
                              <span className="file-desc">{file.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <span className={`category-tag tag-${file.category.toLowerCase()}`}>
                          {file.category}
                        </span>
                      </td>

                      {/* Patient */}
                      <td>
                        {file.patient ? (
                          <div className="patient-link-cell">
                            <span className="patient-name">{file.patient.name}</span>
                            <span className="patient-mrn">{file.patient.mrn}</span>
                          </div>
                        ) : (
                          <span className="unlinked-tag">Institutional / General</span>
                        )}
                      </td>

                      {/* SHA-256 Checksum */}
                      <td>
                        {file.checksum ? (
                          <button
                            className="checksum-badge"
                            title="Click to copy full SHA-256 hash"
                            onClick={() => copyChecksum(file.checksum!)}
                          >
                            <Shield size={12} color="#10b981" />
                            <code>{file.checksum.slice(0, 10)}...</code>
                            {copiedHash === file.checksum ? (
                              <Check size={12} color="#10b981" />
                            ) : (
                              <Copy size={12} color="#94a3b8" />
                            )}
                          </button>
                        ) : (
                          <span className="text-muted">Legacy</span>
                        )}
                      </td>

                      {/* Size */}
                      <td>
                        <span className="size-badge">{formatBytes(file.sizeBytes)}</span>
                      </td>

                      {/* Downloads */}
                      <td>
                        <span className="downloads-badge" title="Audited download accesses">
                          {file.downloadCount}
                        </span>
                      </td>

                      {/* Upload Date & User */}
                      <td>
                        <div className="upload-meta-cell">
                          <span className="upload-date">
                            {new Date(file.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="uploaded-by">
                            {file.uploadedBy?.name || "Staff Member"}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "right" }}>
                        <div className="row-actions">
                          <button
                            className="action-icon-btn preview-btn"
                            title="Inspect & preview file"
                            onClick={() => handleOpenPreview(file)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="action-icon-btn download-btn"
                            title="Generate 15-min signed token & download"
                            disabled={downloadingId === file.id}
                            onClick={() => handleDownload(file)}
                          >
                            {downloadingId === file.id ? (
                              <Spinner size="sm" />
                            ) : (
                              <Download size={16} />
                            )}
                          </button>

                          <button
                            className="action-icon-btn delete-btn"
                            title="Delete document"
                            onClick={() => setDeleteConfirmId(file.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL AI COPILOT */}
      {activeTab === "ai-copilot" && (
        <div className="copilot-view-container animate-fade-in">
          {/* Mandatory Clinical Disclaimer Banner */}
          <div className="clinical-disclaimer-banner glass-panel">
            <div className="disclaimer-icon">
              <AlertTriangle size={24} color="#f59e0b" />
            </div>
            <div className="disclaimer-text">
              <h4>AI-Generated Clinical Intelligence Draft — HIPAA De-Identified Protocol</h4>
              <p>
                All generated clinical summaries, ICD-10 tags, and care plans are diagnostic decision-support aids only.
                Under HIPAA §164.514, names, phone numbers, and MRNs are automatically scrubbed before synthesis.
                <strong> A licensed healthcare provider must verify, validate, and sign all clinical entries before finalizing into official medical charts.</strong>
              </p>
            </div>
          </div>

          <div className="copilot-grid">
            {/* Left Column: Input Form & EMR Presets */}
            <div className="copilot-input-card glass-panel">
              <div className="card-header-row">
                <div className="card-title-group">
                  <Sparkles size={20} color="#8b5cf6" />
                  <h3>Clinical Encounter Notes (SOAP)</h3>
                </div>
                <span className="preset-label">Test Case Presets:</span>
              </div>

              {/* Preset Buttons */}
              <div className="preset-buttons-row">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="preset-chip"
                    onClick={() => {
                      setCopilotForm(preset.data);
                      setClinicalSummary(null);
                      showToast(`Loaded ${preset.label} scenario`, "info");
                    }}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label>Patient Full Name (Scrubbed on server)</label>
                  <input
                    type="text"
                    value={copilotForm.patientName}
                    onChange={(e) => setCopilotForm({ ...copilotForm, patientName: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>MRN / Identifier (Scrubbed on server)</label>
                  <input
                    type="text"
                    value={copilotForm.mrn}
                    onChange={(e) => setCopilotForm({ ...copilotForm, mrn: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Chief Complaint</label>
                <input
                  type="text"
                  value={copilotForm.chiefComplaint}
                  onChange={(e) => setCopilotForm({ ...copilotForm, chiefComplaint: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Subjective (HPI / History)</label>
                <textarea
                  rows={3}
                  value={copilotForm.subjectiveNotes}
                  onChange={(e) => setCopilotForm({ ...copilotForm, subjectiveNotes: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Objective Findings & Diagnostics</label>
                <textarea
                  rows={3}
                  value={copilotForm.objectiveFindings}
                  onChange={(e) => setCopilotForm({ ...copilotForm, objectiveFindings: e.target.value })}
                />
              </div>

              {/* Vitals Row */}
              <div className="vitals-row-compact">
                <div className="vital-item">
                  <span className="vital-name">BP:</span>
                  <input
                    type="text"
                    value={copilotForm.vitals.bloodPressure}
                    onChange={(e) =>
                      setCopilotForm({
                        ...copilotForm,
                        vitals: { ...copilotForm.vitals, bloodPressure: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="vital-item">
                  <span className="vital-name">HR (bpm):</span>
                  <input
                    type="number"
                    value={copilotForm.vitals.heartRate}
                    onChange={(e) =>
                      setCopilotForm({
                        ...copilotForm,
                        vitals: { ...copilotForm.vitals, heartRate: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="vital-item">
                  <span className="vital-name">SpO2 (%):</span>
                  <input
                    type="number"
                    value={copilotForm.vitals.spO2}
                    onChange={(e) =>
                      setCopilotForm({
                        ...copilotForm,
                        vitals: { ...copilotForm.vitals, spO2: Number(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="vital-item">
                  <span className="vital-name">Temp (°C):</span>
                  <input
                    type="number"
                    step="0.1"
                    value={copilotForm.vitals.temperature}
                    onChange={(e) =>
                      setCopilotForm({
                        ...copilotForm,
                        vitals: { ...copilotForm.vitals, temperature: Number(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: "1rem" }}>
                <div className="input-group">
                  <label>Clinical Assessment</label>
                  <textarea
                    rows={2}
                    value={copilotForm.assessment}
                    onChange={(e) => setCopilotForm({ ...copilotForm, assessment: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Care Plan / Interventions</label>
                  <textarea
                    rows={2}
                    value={copilotForm.plan}
                    onChange={(e) => setCopilotForm({ ...copilotForm, plan: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-block btn-synthesize"
                disabled={generatingSummary}
                onClick={handleSynthesizeSummary}
              >
                {generatingSummary ? (
                  <>
                    <Spinner size="sm" />
                    <span>Scrubbing PHI & Synthesizing Clinical Summary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Synthesize Clinical Documentation & ICD-10 Tags</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: AI Output */}
            <div className="copilot-output-card glass-panel">
              <div className="output-header-bar">
                <div className="model-badge">
                  <Shield size={14} color="#10b981" />
                  <span>HIPAA De-Identified Engine</span>
                </div>
                {clinicalSummary && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleCopyChart}
                  >
                    {chartCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{chartCopied ? "Copied!" : "Copy EMR Chart"}</span>
                  </button>
                )}
              </div>

              {!clinicalSummary ? (
                <div className="output-placeholder">
                  <Sparkles size={48} color="#94a3b8" />
                  <h4>Clinical Documentation Awaiting Synthesis</h4>
                  <p>
                    Select an EMR clinical scenario on the left or enter patient SOAP notes to generate:
                  </p>
                  <ul className="placeholder-benefits">
                    <li>Structured Executive Summary & Findings</li>
                    <li>Automated ICD-10 Diagnostic Tagging</li>
                    <li>Evidence-Based Care Plan Recommendations</li>
                    <li>PHI Scrubbing with SHA-256 Audit Trail</li>
                  </ul>
                </div>
              ) : (
                <div className="summary-result-content">
                  {/* Status Banner */}
                  <div className="verification-pill">
                    <div className="verification-status-group">
                      <div className="status-icon-badge">
                        <CheckCircle2 size={17} color="#2563eb" />
                      </div>
                      <div className="status-label-stack">
                        <span className="status-sub-label">Draft Review Status</span>
                        <span className="status-pill-badge" title={clinicalSummary.reviewStatus}>
                          {formatReviewStatus(clinicalSummary.reviewStatus)}
                        </span>
                      </div>
                    </div>

                    <div className="confidence-metric-block">
                      <div className="confidence-text-row">
                        <span className="confidence-title">AI Confidence</span>
                        <span className="confidence-pct">
                          {Math.round(clinicalSummary.confidence * 100)}%
                        </span>
                      </div>
                      <div className="confidence-bar-track" aria-hidden="true">
                        <div
                          className="confidence-bar-fill"
                          style={{
                            width: `${Math.min(100, Math.max(0, Math.round(clinicalSummary.confidence * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="section-block">
                    <span className="section-title">Executive Clinical Narrative</span>
                    <div className="narrative-box">
                      <p>{clinicalSummary.executiveSummary}</p>
                    </div>
                  </div>

                  {/* Pertinent Findings */}
                  <div className="section-block">
                    <span className="section-title">Pertinent Positive & Negative Findings</span>
                    <div className="findings-pills">
                      {clinicalSummary.pertinentFindings.map((finding, idx) => (
                        <div key={idx} className="finding-pill">
                          <Activity size={14} color="#3b82f6" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Suggested ICD-10 */}
                  <div className="section-block">
                    <span className="section-title">Suggested ICD-10 Diagnostic Tags</span>
                    <div className="icd-tags-row">
                      {clinicalSummary.suggestedICD10.map((icd, idx) => (
                        <div key={idx} className="icd-tag-card">
                          <span className="icd-code">{icd.code}</span>
                          <span className="icd-desc">{icd.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Care Plan Recommendations */}
                  <div className="section-block">
                    <span className="section-title">Evidence-Based Care Plan Recommendations</span>
                    <ul className="care-plan-list">
                      {clinicalSummary.carePlanRecommendations.map((rec, idx) => (
                        <li key={idx} className="care-plan-item">
                          <CheckCircle2 size={16} color="#10b981" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Chronology & Med Reconciliation */}
                  <div className="section-block">
                    <span className="section-title">Clinical Chronology & Medication Reconciliation</span>
                    <div className="narrative-box muted-box">
                      <p><strong>Chronology:</strong> {clinicalSummary.clinicalChronology}</p>
                      <p style={{ marginTop: "0.5rem" }}>
                        <strong>Medications:</strong> {clinicalSummary.medicationReconciliation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIONAL ASSISTANT */}
      {activeTab === "operational" && (
        <div className="operational-view-container animate-fade-in">
          {/* Assistant Info */}
          <div className="op-hero-banner glass-panel">
            <div className="op-hero-icon">
              <Bot size={32} color="#3b82f6" />
            </div>
            <div className="op-hero-text">
              <h3>CareFlow Operational Intelligence Assistant</h3>
              <p>
                Grounded in live database queries across bed censuses, appointment queues, pharmacy inventory, and billing receivables.
                No hallucinations — answers are dynamically computed from active tenant tables.
              </p>
            </div>
          </div>

          {/* Quick Prompt Cards */}
          <div className="quick-prompts-grid">
            <div
              className="quick-prompt-card glass-panel"
              onClick={() => handleQueryOperational("What is our current bed occupancy and ICU capacity?")}
            >
              <div className="prompt-icon" style={{ backgroundColor: "rgba(139, 92, 246, 0.15)" }}>
                <Building2 size={20} color="#8b5cf6" />
              </div>
              <div className="prompt-details">
                <h4>Bed Occupancy & Census</h4>
                <p>"What is our current bed occupancy and ICU capacity?"</p>
              </div>
            </div>

            <div
              className="quick-prompt-card glass-panel"
              onClick={() => handleQueryOperational("Which medicines are low on stock or depleted?")}
            >
              <div className="prompt-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)" }}>
                <HeartPulse size={20} color="#f59e0b" />
              </div>
              <div className="prompt-details">
                <h4>Pharmacy Stock Depletion</h4>
                <p>"Which medicines are low on stock or depleted?"</p>
              </div>
            </div>

            <div
              className="quick-prompt-card glass-panel"
              onClick={() => handleQueryOperational("How many patients are waiting in the clinic queue?")}
            >
              <div className="prompt-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}>
                <Clock size={20} color="#3b82f6" />
              </div>
              <div className="prompt-details">
                <h4>Queue Bottlenecks</h4>
                <p>"How many patients are waiting in the clinic queue?"</p>
              </div>
            </div>

            <div
              className="quick-prompt-card glass-panel"
              onClick={() => handleQueryOperational("What is our pending billing and outstanding receivables?")}
            >
              <div className="prompt-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}>
                <Shield size={20} color="#10b981" />
              </div>
              <div className="prompt-details">
                <h4>Financial Receivables</h4>
                <p>"What is our pending billing and outstanding receivables?"</p>
              </div>
            </div>
          </div>

          {/* Custom Query Input Bar */}
          <div className="op-query-bar glass-panel">
            <input
              type="text"
              placeholder="Ask anything about hospital operations, bed availability, queue times, or inventory..."
              value={opQuery}
              onChange={(e) => setOpQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQueryOperational()}
            />
            <button
              className="btn btn-primary"
              disabled={queryingOp || !opQuery.trim()}
              onClick={() => handleQueryOperational()}
            >
              {queryingOp ? <Spinner size="sm" /> : <Bot size={18} />}
              <span>Ask Assistant</span>
            </button>
          </div>

          {/* Response Container */}
          {queryingOp && (
            <div className="op-loading-card glass-panel">
              <Spinner size="md" />
              <p>Querying hospital database across multi-tenant partitions...</p>
            </div>
          )}

          {opResult && !queryingOp && (
            <div className="op-result-card glass-panel animate-fade-in">
              <div className="result-header">
                <div className="result-query-tag">
                  <span className="label">Query:</span>
                  <span className="val">"{opResult.query}"</span>
                </div>
                <div className="timestamp-tag">
                  <Clock size={12} />
                  <span>{new Date(opResult.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Natural Language Answer */}
              <div className="result-answer-box">
                <p>{opResult.answer}</p>
              </div>

              {/* Live Metric Telemetry Grid */}
              {opResult.metrics && Object.keys(opResult.metrics).length > 0 && (
                <div className="telemetry-block">
                  <span className="telemetry-title">Verified Database Telemetry</span>
                  <div className="telemetry-metrics-grid">
                    {Object.entries(opResult.metrics).map(([key, value]) => {
                      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                        return null;
                      }
                      if (Array.isArray(value)) {
                        return (
                          <div key={key} className="telemetry-metric-card full-width">
                            <span className="t-label">{key.replace(/([A-Z])/g, " $1")}</span>
                            <div className="t-list-chips">
                              {value.map((item: any, i: number) => (
                                <span key={i} className="t-chip">
                                  {typeof item === "string" ? item : item.name || JSON.stringify(item)}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="telemetry-metric-card">
                          <span className="t-label">{key.replace(/([A-Z])/g, " $1")}</span>
                          <span className="t-val">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="result-footer">
                <span className="disclaimer-mini">{opResult.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadOpen && (
        <div className="modal-backdrop" onClick={() => !uploading && setIsUploadOpen(false)}>
          <div className="modal-window glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Lock size={18} color="#10b981" />
                <h3>Upload Clinical Document</h3>
              </div>
              <button
                className="close-modal-btn"
                disabled={uploading}
                onClick={() => setIsUploadOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="modal-form">
              {/* File Dropzone */}
              <div className="dropzone-area">
                <input
                  type="file"
                  id="file-upload-input"
                  className="file-native-input"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadSelectedFile(e.target.files[0]);
                    }
                  }}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.dcm,.dicom,.txt,.docx"
                />
                <label htmlFor="file-upload-input" className="dropzone-label">
                  <Upload size={36} color="#3b82f6" />
                  {uploadSelectedFile ? (
                    <div className="chosen-file-info">
                      <strong>{uploadSelectedFile.name}</strong>
                      <span>({formatBytes(uploadSelectedFile.size)})</span>
                    </div>
                  ) : (
                    <div className="dropzone-prompt">
                      <strong>Click to browse or drop document here</strong>
                      <span>Supports PDF, DICOM, PNG, JPG, DOCX (Max 10MB)</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Category */}
              <div className="input-group">
                <label>Document Category *</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  required
                >
                  <option value="Radiology">Radiology & Medical Imaging (X-Ray, CT, MRI)</option>
                  <option value="LabReport">Laboratory Report (Biochemistry, CBC)</option>
                  <option value="DischargeSummary">Discharge Summary & Epicrisis</option>
                  <option value="Prescription">Prescription / Medication Order</option>
                  <option value="Insurance">Insurance Policy & Government ID</option>
                  <option value="Other">General Clinical Document</option>
                </select>
              </div>

              {/* Linked Patient */}
              <div className="input-group">
                <label>Linked Patient (Optional)</label>
                <select
                  value={uploadPatientId}
                  onChange={(e) => setUploadPatientId(e.target.value)}
                >
                  <option value="">-- No linked patient (Hospital General) --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="input-group">
                <label>Description / Clinical Notes</label>
                <input
                  type="text"
                  placeholder="e.g., Post-operative PA chest film showing resolved consolidation"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={uploading}
                  onClick={() => setIsUploadOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading || !uploadSelectedFile}
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Encrypting & Storing...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Upload & Seal Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FILE PREVIEW MODAL */}
      {previewFile && (
        <div className="modal-backdrop" onClick={closePreview}>
          <div className="modal-window preview-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Shield size={18} color="#8b5cf6" />
                <h3 title={previewFile.originalName}>Preview: {previewFile.originalName}</h3>
              </div>
              <button className="close-modal-btn" onClick={closePreview}>
                <X size={18} />
              </button>
            </div>

            <div className="preview-modal-body">
              {/* Metadata strip */}
              <div className="preview-meta-strip">
                <div className="meta-pill">
                  <span className="label">Category:</span>
                  <span className="val">{previewFile.category}</span>
                </div>
                <div className="meta-pill">
                  <span className="label">MIME:</span>
                  <span className="val">{previewFile.mimeType}</span>
                </div>
                <div className="meta-pill">
                  <span className="label">Size:</span>
                  <span className="val">{formatBytes(previewFile.sizeBytes)}</span>
                </div>
                <div className="meta-pill">
                  <span className="label">Downloads:</span>
                  <span className="val">{previewFile.downloadCount}</span>
                </div>
              </div>

              {/* SHA-256 Checksum banner */}
              {previewFile.checksum && (
                <div className="checksum-banner">
                  <Shield size={16} color="#10b981" />
                  <span>SHA-256: <code>{previewFile.checksum}</code></span>
                  <button
                    className="copy-btn-mini"
                    onClick={() => copyChecksum(previewFile.checksum!)}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              )}

              {/* Media viewer */}
              <div className="preview-media-container">
                {previewLoading ? (
                  <div className="preview-loading">
                    <Spinner size="lg" />
                    <p>Generating short-lived cryptographic preview token...</p>
                  </div>
                ) : previewSignedUrl ? (
                  previewFile.mimeType.startsWith("image/") ? (
                    <div className="image-preview-wrapper">
                      <img
                        src={previewSignedUrl}
                        alt={previewFile.originalName}
                        className="preview-image"
                      />
                    </div>
                  ) : previewFile.mimeType.includes("pdf") ? (
                    <div className="pdf-preview-box">
                      <FileText size={64} color="#ef4444" />
                      <h4>PDF Document Ready</h4>
                      <p>View inline or download through cryptographically signed streaming channel.</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => window.open(previewSignedUrl, "_blank")}
                      >
                        <Eye size={16} />
                        <span>Open Document In Full Window</span>
                      </button>
                    </div>
                  ) : (
                    <div className="generic-preview-box">
                      <FileText size={64} color="#3b82f6" />
                      <h4>{previewFile.originalName}</h4>
                      <p>MIME Type: {previewFile.mimeType}</p>
                    </div>
                  )
                ) : (
                  <p>Unable to load file preview.</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closePreview}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleDownload(previewFile);
                }}
              >
                <Download size={16} />
                <span>Download Secure Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        isOpen={Boolean(deleteConfirmId)}
        title="Permanently Delete Clinical Document?"
        message="This document will be permanently expunged from the private file storage system. A HIPAA compliance audit record will be logged."
        confirmText="Expunge Document"
        cancelText="Keep File"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
};

export default MedicalFiles;
