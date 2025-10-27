import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);

  // Not logged in or not admin → redirect to home
  if (!user || !user.isAdmin) return <Navigate to="/" replace />;

  // Admin → render the children (protected page)
  return children;
}
