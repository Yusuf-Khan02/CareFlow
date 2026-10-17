import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { labService } from "../../services/labService";
import { patientService } from "../../services/patientService";
import { doctorService } from "../../services/doctorService";
import { FlaskConical, X } from "../common/Icons";
import { useToast } from "../common";
import type { LabOrderPriority, Patient, Doctor } from "../../types";
import "./OrderLabTestModal.css";

interface OrderLabTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPatientId?: number;
  defaultDoctorId?: number;
  consultationId?: string;
}

export const OrderLabTestModal: React.FC<OrderLabTestModalProps> = ({
  isOpen,
  onClose,
  defaultPatientId,
  defaultDoctorId,
  consultationId,
}) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [patientId, setPatientId] = useState<number | "">(defaultPatientId || "");
  const [doctorId, setDoctorId] = useState<number | "">(defaultDoctorId || "");
  const [selectedCatalogIndex, setSelectedCatalogIndex] = useState<number>(0);
  const [priority, setPriority] = useState<LabOrderPriority>("Routine");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");

  // Fetch Patients
  const { data: patientData } = useQuery({
    queryKey: ["patients"],
    queryFn: () => patientService.getPatients(),
    enabled: isOpen,
  });
  const patients: Patient[] = patientData?.patients || [];

  // Fetch Doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorService.getDoctors(),
    enabled: isOpen,
  });

  // Fetch Catalog
  const { data: catalog = [] } = useQuery({
    queryKey: ["labCatalog"],
    queryFn: () => labService.getCatalog(),
    enabled: isOpen,
  });

  // Auto-fill defaults
  useEffect(() => {
    if (defaultPatientId) setPatientId(defaultPatientId);
    if (defaultDoctorId) setDoctorId(defaultDoctorId);
    else if (!doctorId && doctors.length > 0) setDoctorId(doctors[0].id);
  }, [defaultPatientId, defaultDoctorId, doctors, isOpen]);

  const selectedTest = catalog[selectedCatalogIndex] || {
    category: "Hematology",
    testName: "Complete Blood Count (CBC)",
  };

  const createOrderMutation = useMutation({
    mutationFn: labService.createLabOrder,
    onSuccess: (newOrder) => {
      showToast(`Diagnostic order ${newOrder.orderNumber} placed successfully!`, "success");
      queryClient.invalidateQueries({ queryKey: ["labOrders"] });
      onClose();
      setClinicalNotes("");
    },
    onError: (err: any) => {
      showToast(err.message || "Failed to place lab order.", "error");
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      showToast("Please choose a patient for this diagnostic order.", "error");
      return;
    }
    if (!doctorId) {
      showToast("Please assign the ordering physician.", "error");
      return;
    }

    createOrderMutation.mutate({
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      consultationId: consultationId || null,
      testCategory: selectedTest.category,
      testName: selectedTest.testName,
      priority,
      clinicalNotes: clinicalNotes.trim() || undefined,
    });
  };

  return (
    <div className="lab-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lab-modal-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="lab-modal-header">
          <div className="lab-modal-title">
            <FlaskConical size={20} color="#0f766e" />
            <span>Order Diagnostic Laboratory Test</span>
          </div>
          <button type="button" className="lab-btn lab-btn-secondary" onClick={onClose} style={{ padding: "0.4rem" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="lab-modal-body">
            {/* Patient Select */}
            <div className="lab-form-group">
              <label className="lab-form-label">Patient Name & Medical Record:</label>
              <select
                className="lab-form-select"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value ? Number(e.target.value) : "")}
                required
                id="order-patient-select"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p: Patient) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.mrn}) — {p.age}y, {p.gender}
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Select */}
            <div className="lab-form-group">
              <label className="lab-form-label">Ordering Physician / Consultant:</label>
              <select
                className="lab-form-select"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value ? Number(e.target.value) : "")}
                required
                id="order-doctor-select"
              >
                {doctors.map((d: Doctor) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialty})
                  </option>
                ))}
              </select>
            </div>

            {/* Test Panel Selection from Catalog */}
            <div className="lab-form-group">
              <label className="lab-form-label">Diagnostic Test Panel:</label>
              <select
                className="lab-form-select"
                value={selectedCatalogIndex}
                onChange={(e) => setSelectedCatalogIndex(Number(e.target.value))}
                id="order-test-select"
              >
                {catalog.map((t, idx) => (
                  <option key={t.testName} value={idx}>
                    [{t.category}] {t.testName} • Sample: {t.sampleType} (~{t.turnaroundHours}h)
                  </option>
                ))}
              </select>
              {selectedTest.description && (
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                  {selectedTest.description}
                </p>
              )}
            </div>

            {/* Priority Selection */}
            <div className="lab-form-group">
              <label className="lab-form-label">Diagnostic Priority & Urgency:</label>
              <div className="lab-priority-picker">
                <button
                  type="button"
                  className={`lab-priority-btn routine ${priority === "Routine" ? "active" : ""}`}
                  onClick={() => setPriority("Routine")}
                >
                  🟢 Routine
                </button>
                <button
                  type="button"
                  className={`lab-priority-btn urgent ${priority === "Urgent" ? "active" : ""}`}
                  onClick={() => setPriority("Urgent")}
                >
                  🟡 Urgent
                </button>
                <button
                  type="button"
                  className={`lab-priority-btn stat ${priority === "STAT" ? "active" : ""}`}
                  onClick={() => setPriority("STAT")}
                >
                  🚨 STAT (Emergency)
                </button>
              </div>
            </div>

            {/* Clinical Notes / Indications */}
            <div className="lab-form-group">
              <label className="lab-form-label">Clinical Indication & Instructions:</label>
              <textarea
                className="lab-form-textarea"
                rows={3}
                placeholder="Reason for test, suspected differential diagnosis, fasting status..."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                id="order-notes-textarea"
              />
            </div>
          </div>

          <div className="lab-modal-footer">
            <button type="button" className="lab-btn lab-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="lab-btn lab-btn-primary"
              disabled={createOrderMutation.isPending}
              id="confirm-order-lab-btn"
            >
              <FlaskConical size={15} />
              <span>{createOrderMutation.isPending ? "Generating Order..." : "Confirm & Send to Lab"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
