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
  Laboratory,
  Pharmacy,
  NotFound,
  AccessDenied,
} from "../pages";
import MainLayout from "../layouts/MainLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Login Screen (Standalone without sidebar/navbar) */}
      <Route path="/login" element={<Login />} />

      {/* Main Application Layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Patient Management Routes */}
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientDetails />} />

        {/* Doctor & Staff Management Routes */}
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />

        {/* Operational Modules */}
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/laboratory" element={<Laboratory />} />
        <Route path="/pharmacy" element={<Pharmacy />} />

        {/* 403 Access Denied */}
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Catch-all 404 Route within layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;