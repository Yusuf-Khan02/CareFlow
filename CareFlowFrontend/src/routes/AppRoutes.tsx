import { Routes, Route, Navigate } from "react-router-dom";
import {
  Login,
  Dashboard,
  Patients,
  PatientDetails,
  Doctors,
  DoctorDetails,
  Appointments,
  Queue,
  Consultation,
  Laboratory,
  Pharmacy,
  Beds,
  Billing,
  Reports,
  NotFound,
  AccessDenied,
  AuditLogs,
  BackgroundJobs,
  MedicalFiles,
} from "../pages";
import MainLayout from "../layouts/MainLayout";
import { ProtectedRoute } from "../components/common";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Login Screen (Public, Standalone) */}
      <Route path="/login" element={<Login />} />

      {/* Protected Hospital Application Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Patient Management Routes */}
        <Route
          path="/patients"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"]}>
              <PatientDetails />
            </ProtectedRoute>
          }
        />

        {/* Doctor & Staff Management Routes */}
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />

        {/* Operational Modules */}
        <Route path="/appointments" element={<Appointments />} />
        <Route
          path="/queue"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"]}>
              <Queue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consultations"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse"]}>
              <Consultation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laboratory"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "LabTech", "Nurse"]}>
              <Laboratory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacy"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Pharmacist"]}>
              <Pharmacy />
            </ProtectedRoute>
          }
        />
        <Route
          path="/beds"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist"]}>
              <Beds />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Receptionist"]}>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor"]}>
              <AuditLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor"]}>
              <BackgroundJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/files"
          element={
            <ProtectedRoute requiredRoles={["Admin", "Hospital Admin", "Doctor", "Nurse", "LabTech"]}>
              <MedicalFiles />
            </ProtectedRoute>
          }
        />

        {/* 403 Access Denied */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Catch-all 404 Route within layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;