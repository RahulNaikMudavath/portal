import { useState } from "react";
import { Navigate } from "react-router-dom";
import ForcePasswordResetModal from "../components/auth/ForcePasswordResetModal";

function ProtectedRoute({ children, role }) {
  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user && user.isOnboarded === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  const handlePasswordResetSuccess = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <>
      {user.mustChangePassword && (
        <ForcePasswordResetModal
          isOpen={true}
          onSuccess={handlePasswordResetSuccess}
        />
      )}
      {children}
    </>
  );
}

export default ProtectedRoute;