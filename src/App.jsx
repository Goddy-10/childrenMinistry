

// src/App.jsx
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./components/Layout";
import Header from "./components/Header";
import Teachers from "./pages/Teachers";
import ClassesPage from "./pages/Classes";
import Children from "./pages/Children";
import { Toaster } from "./components/ui/toaster";
import Reports from "./pages/Reports";
import Timetable from "./pages/Timetable";
import Adults from "./pages/Adults";
import ChildrenMinistry from "./pages/ChildrenMinistry";
import VisitorForm from "./pages/VisitorForm";
import VisitorQRCode from "./pages/VisitorQrCode";

import Gallery from "./pages/Gallery";
import ProgramsTab from "./components/ProgramsTab";
import Events from "./pages/Events";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <>
      <Header />
      <div className="pt-16">
        <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/visitor-form" element={<VisitorForm />} />

            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            {/* 🔒 Profile: visible only when logged in */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adults"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <Adults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />

            {/* 🔒 Visitor QR: admin only */}
            <Route
              path="/visitor-qr"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <VisitorQRCode />
                </ProtectedRoute>
              }
            />

            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />

            {/* 🔒 Children Ministry restricted to admin & teacher */}
            <Route
              path="/children-ministry"
              element={
                <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                  <ChildrenMinistry />
                </ProtectedRoute>
              }
            >
              {/* Shared access for admin + teacher */}
              <Route
                path="timetable"
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                    <Timetable />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="classes"
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                    <ClassesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="children"
                element={
                  <ProtectedRoute allowedRoles={["admin", "teacher"]}>
                    <Children />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only tabs */}
              <Route
                path="teachers"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Teachers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="programs"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ProgramsTab />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </div>
      <Toaster />
    </>
  );
}