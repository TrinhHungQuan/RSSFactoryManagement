import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const expiryDate =
    localStorage.getItem("expiryDate") || sessionStorage.getItem("expiryDate");

  const isExpired =
    expiryDate && new Date().getTime() > new Date(expiryDate).getTime();

  if (!token || isExpired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
