import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { WorkRequestProvider } from "./context/WorkRequestContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./utils/ProtectedRoute";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import CreateTask from "./pages/admin/CreateTask";
import AdminProfile from "./pages/admin/AdminProfile";
import Activity from "./pages/admin/Activity";
import WhatsAppInbox from "./pages/admin/WhatsAppInbox";

// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import MyTasks from "./pages/client/MyTasks";
import Submissions from "./pages/client/Submissions";
import Profile from "./pages/client/Profile";
import WorkInbox from "./pages/admin/WorkInbox";
import { Navigate } from "react-router-dom";
import CreateAIWorkRequest from "./pages/admin/CreateAIWorkRequest";

function App() {
  return (
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
            path="/admin/tasks"
            element={
              <ProtectedRoute role="admin">
                <AdminTasks />
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
          </Routes>
        </BrowserRouter>
      </WorkRequestProvider>
    </ThemeProvider>
  );
}

export default App;