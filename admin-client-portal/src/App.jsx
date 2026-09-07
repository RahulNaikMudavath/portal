import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkRequestProvider } from "./context/WorkRequestContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompleteProfile from "./pages/CompleteProfile";
import ProtectedRoute from "./utils/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";

// Lazy-loaded Admin pages
const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminTasks = React.lazy(() => import("./pages/admin/AdminTasks"));
const CreateTask = React.lazy(() => import("./pages/admin/CreateTask"));
const AdminProfile = React.lazy(() => import("./pages/admin/AdminProfile"));
const Activity = React.lazy(() => import("./pages/admin/Activity"));
const WhatsAppInbox = React.lazy(() => import("./pages/admin/WhatsAppInbox"));
const EngineerPerformanceDashboard = React.lazy(() => import("./pages/admin/EngineerPerformanceDashboard"));
const ReportsCenter = React.lazy(() => import("./pages/admin/ReportsCenter"));
const CreateAIWorkRequest = React.lazy(() => import("./pages/admin/CreateAIWorkRequest"));

// Lazy-loaded Client / Engineer pages
const ClientDashboard = React.lazy(() => import("./pages/engineer/ClientDashboard"));
const MyTasks = React.lazy(() => import("./pages/engineer/MyTasks"));
const Submissions = React.lazy(() => import("./pages/engineer/Submissions"));
const Profile = React.lazy(() => import("./pages/engineer/Profile"));

// Lazy-loaded Shared pages
const ProjectsWorkspace = React.lazy(() => import("./pages/shared/ProjectsWorkspace"));
const DocumentCenter = React.lazy(() => import("./pages/shared/DocumentCenter"));
const ProjectCalendar = React.lazy(() => import("./pages/shared/ProjectCalendar"));

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1073860000000-dummygoogleclientidfortesting.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <WorkRequestProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public & Auth routes */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />

                {/* Admin routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/engineer-performance"
                  element={
                    <ProtectedRoute role="admin">
                      <EngineerPerformanceDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/calendar"
                  element={
                    <ProtectedRoute role="admin">
                      <ProjectCalendar />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute role="admin">
                      <ReportsCenter />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/tasks"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminTasks />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/projects"
                  element={
                    <ProtectedRoute role="admin">
                      <ProjectsWorkspace role="admin" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/documents"
                  element={
                    <ProtectedRoute role="admin">
                      <DocumentCenter role="admin" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/create"
                  element={
                    <ProtectedRoute role="admin">
                      <CreateTask />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute role="admin">
                      <AdminProfile />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/work-inbox"
                  element={
                    <ProtectedRoute role="admin">
                      <WhatsAppInbox />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/whatsapp"
                  element={
                    <ProtectedRoute role="admin">
                      <WhatsAppInbox />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/activity"
                  element={
                    <ProtectedRoute role="admin">
                      <Activity />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin/create-ai-request"
                  element={
                    <ProtectedRoute role="admin">
                      <CreateAIWorkRequest />
                    </ProtectedRoute>
                  }
                />

                {/* Client / Engineer routes */}
                <Route
                  path="/client/dashboard"
                  element={
                    <ProtectedRoute role="client">
                      <ClientDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/tasks"
                  element={
                    <ProtectedRoute role="client">
                      <MyTasks />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/projects"
                  element={
                    <ProtectedRoute role="client">
                      <ProjectsWorkspace role="client" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/documents"
                  element={
                    <ProtectedRoute role="client">
                      <DocumentCenter role="client" />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/calendar"
                  element={
                    <ProtectedRoute role="client">
                      <ProjectCalendar />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/submissions"
                  element={
                    <ProtectedRoute role="client">
                      <Submissions />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/client/profile"
                  element={
                    <ProtectedRoute role="client">
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </WorkRequestProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;