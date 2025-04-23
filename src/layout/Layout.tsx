import Sider from "../components/Sider";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import LogoutConfirm from "../components/LogoutConfirm";
import LoginExpired from "../components/LoginExpired";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../services/api";

const Layout = () => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [showLoginExpired, setShowLoginExpired] = useState(false);
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const closeSider = () => setIsSiderCollapsed(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const expiryDate =
      localStorage.getItem("expiryDate") ||
      sessionStorage.getItem("expiryDate");

    if (token && expiryDate) {
      const currentTime = new Date().getTime();
      const expiryTime = new Date(expiryDate).getTime();

      if (currentTime > expiryTime) {
        setShowLoginExpired(true);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      {
        navigate("/login");
      }
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return null;
  }

  const logout = async (token: string) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.logout,
        {
          token: token,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Logout successful:", response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Logout failed:", error.message);
        console.error("Backend response:", error.response?.data);
      } else {
        console.error("Unknown error during logout", error);
      }
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("currentRole");
      sessionStorage.removeItem("token");
      localStorage.removeItem("expiryDate");
      sessionStorage.removeItem("expiryDate");

      setShowLogoutConfirmation(false);
      navigate("/login");
    }
  };

  const handleExpiredLogin = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("expiryDate");

      setShowLoginExpired(false);
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen relative">
      <div
        className={`top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          isSiderCollapsed ? "w-[60px]" : "w-[220px]"
        } bg-white shadow-lg flex`}
      >
        <Sider
          closeSider={closeSider}
          isCollapsed={isSiderCollapsed}
          toggleSider={() => setIsSiderCollapsed(!isSiderCollapsed)}
          onLogout={() => setShowLogoutConfirmation(true)}
        />
      </div>

      {/* Backdrop */}
      {!isSiderCollapsed && (
        <div className="fixed inset-0 bg-black opacity-50 z-40" />
      )}

      {/* Confirmation Dialog */}
      {showLogoutConfirmation && (
        <LogoutConfirm
          handleLogout={handleLogout}
          onCancel={() => setShowLogoutConfirmation(false)}
        />
      )}

      {/* Login Expired Dialog */}
      {showLoginExpired && (
        <LoginExpired handleExpiredLogin={handleExpiredLogin} />
      )}

      {/* Main content */}
      <div className="flex-1">
        <Outlet context={{ isSiderCollapsed }} />
      </div>
    </div>
  );
};

export default Layout;
