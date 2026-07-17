import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkRequestProvider } from "./context/WorkRequestContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompleteProfile from "./pages/CompleteProfile";
import ProtectedRoute from "./utils/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import CreateTask from "./pages/admin/CreateTask";
import AdminProfile from "./pages/admin/AdminProfile";
import Activity from "./pages/admin/Activity";
import WhatsAppInbox from "./pages/admin/WhatsAppInbox";
import EngineerPerformanceDashboard from "./pages/admin/EngineerPerformanceDashboard";
import ReportsCenter from "./pages/admin/ReportsCenter";

// Client pages
import ClientDashboard from "./pages/engineer/ClientDashboard";
import MyTasks from "./pages/engineer/MyTasks";
import Submissions from "./pages/engineer/Submissions";
import Profile from "./pages/engineer/Profile";
import WorkInbox from "./pages/admin/WorkInbox";
import { Navigate } from "react-router-dom";
import CreateAIWorkRequest from "./pages/admin/CreateAIWorkRequest";
import ProjectsWorkspace from "./pages/shared/ProjectsWorkspace";
import DocumentCenter from "./pages/shared/DocumentCenter";
import ProjectCalendar from "./pages/shared/ProjectCalendar";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1073860000000-dummygoogleclientidfortesting.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <WorkRequestProvider>
          <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

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
    path="*"
    element={<Navigate to="/admin/dashboard" />}
/>

          <Route
            path="/admin/activity"
            element={
              <ProtectedRoute role="admin">
                <Activity />
              </ProtectedRoute>
            }
          />

          {/* Client routes */}
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
          <Route
    path="/admin/create-ai-request"
    element={
        <ProtectedRoute role="admin">
            <CreateAIWorkRequest />
        </ProtectedRoute>
    }
/>

          {/* Unknown route */}
          <Route path="*" element={<Login />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          </Routes>
        </BrowserRouter>
      </WorkRequestProvider>
    </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;