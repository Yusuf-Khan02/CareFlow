import React, { useState, useEffect } from "react";
import type { Patient, PatientStatus, BloodGroup } from "../../types";
import { InputField, SelectField } from "../common";
import "./PatientModal.css";

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patientData: Partial<Patient>) => void;
  initialData?: Patient | null;
}

const DEPARTMENTS = [
  { label: "Cardiology", value: "Cardiology" },
  { label: "Neurology", value: "Neurology" },
  { label: "Gastroenterology", value: "Gastro" },
  { label: "Orthopedics", value: "Orthology" },
  { label: "General Physician", value: "General Physician" },
  { label: "Pediatrics", value: "Pediatrics" },
];

const GENDERS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

const STATUSES: { label: string; value: PatientStatus }[] = [
  { label: "Active", value: "Active" },
  { label: "Critical", value: "Critical" },
  { label: "Discharged", value: "Discharged" },
];

const BLOOD_GROUPS: { label: string; value: BloodGroup }[] = [
  { label: "O+", value: "O+" },
  { label: "O-", value: "O-" },
  { label: "A+", value: "A+" },
  { label: "A-", value: "A-" },
  { label: "B+", value: "B+" },
  { label: "B-", value: "B-" },
  { label: "AB+", value: "AB+" },
  { label: "AB-", value: "AB-" },
];

export const PatientModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}: PatientModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
    department: "Cardiology",
    status: "Active" as PatientStatus,
    bloodGroup: "O+" as BloodGroup,
    emergencyName: "",
    emergencyRelation: "Spouse",
    emergencyPhone: "",
    allergies: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        age: initialData.age.toString(),
        gender: initialData.gender,
        phone: initialData.phone,
        email: initialData.email,
        address: initialData.address,
        department: initialData.department,
        status: initialData.status,
        bloodGroup: initialData.bloodGroup,
        emergencyName: initialData.emergencyContact?.name || "",
        emergencyRelation: initialData.emergencyContact?.relation || "Family",
        emergencyPhone: initialData.emergencyContact?.phone || "",
        allergies: initialData.allergies?.join(", ") || "",
      });
    } else {
      setFormData({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        email: "",
        address: "",
        department: "Cardiology",
        status: "Active",
        bloodGroup: "O+",
        emergencyName: "",
        emergencyRelation: "Family",
        emergencyPhone: "",
        allergies: "",
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 130) {
      newErrors.age = "Please enter a valid age (1-130)";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Contact phone number is required";
    }
    if (formData.email && !formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedAllergies = formData.allergies
      ? formData.allergies.split(",").map((s) => s.trim()).filter(Boolean)
      : ["None known"];

    onSave({
      name: formData.name.trim(),
      age: Number(formData.age),
      gender: formData.gender as "Male" | "Female" | "Other",
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, ".")}@demo.org`,
      address: formData.address.trim() || "Main Clinic Ward",
      department: formData.department,
      status: formData.status,
      bloodGroup: formData.bloodGroup,
      emergencyContact: {
        name: formData.emergencyName || "Next of Kin",
        relation: formData.emergencyRelation || "Family",
        phone: formData.emergencyPhone || formData.phone,
      },
      allergies: parsedAllergies,
    });

    onClose();
  };

  return (
    <div className="patient-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="patient-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="patient-modal-header">
          <div>
            <h2 className="patient-modal-title">
              {initialData ? "Edit Patient Record" : "Register New Patient"}
            </h2>
            <p className="patient-modal-subtitle">
              {initialData
                ? `Update details for ${initialData.name} (${initialData.mrn})`
                : "Enter synthetic patient demographic and emergency medical details"}
            </p>
          </div>
          <button
            type="button"
            className="patient-modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-modal-form">
          <div className="form-two-col">
            <InputField
              label="Patient Full Name"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
              required
            />
            <div className="form-sub-two-col">
              <InputField
                label="Age"
                type="number"
                placeholder="42"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                error={errors.age}
                required
              />
              <SelectField
                label="Gender"
                options={GENDERS}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              />
            </div>
          </div>

          <div className="form-two-col">
            <InputField
              label="Contact Phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={errors.phone}
              required
            />
            <InputField
              label="Email Address"
              type="email"
              placeholder="patient@hospital.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
          </div>

          <div className="form-three-col">
            <SelectField
              label="Assigned Department"
              options={DEPARTMENTS}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <SelectField
              label="Triage Status"
              options={STATUSES}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as PatientStatus })}
            />
            <SelectField
              label="Blood Group"
              options={BLOOD_GROUPS}
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
            />
          </div>

          <InputField
            label="Residential Address"
            placeholder="Street, City, State"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="patient-modal-section-title">
            EMERGENCY CONTACT & MEDICAL ALERTS
          </div>

          <div className="form-three-col">
            <InputField
              label="Contact Person Name"
              placeholder="e.g. Sunita Sharma"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />
            <InputField
              label="Relation"
              placeholder="Spouse / Parent / Sibling"
              value={formData.emergencyRelation}
              onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
            />
            <InputField
              label="Emergency Phone"
              placeholder="+91 98765 43299"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>

          <InputField
            label="Known Allergies (Comma separated)"
            placeholder="e.g. Penicillin, Sulfa drugs, Peanuts (or 'None')"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            helperText="Separate multiple allergies with commas"
          />

          <div className="patient-modal-actions">
            <button
              type="button"
              className="modal-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-submit-btn"
              id="btn-save-patient"
            >
              {initialData ? "Save Changes" : "Register Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
