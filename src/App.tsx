import { Route, Routes } from "react-router-dom";
import "./App.css";
import ItemsPage from "./pages/items-page/ItemsPage";
import Layout from "./layout/Layout";
import DashboardPage from "./pages/dashboard-page/DashboardPage";
import JobsPage from "./pages/jobs-page/JobsPage";
import SpecialProjectsPage from "./pages/specialprojects-page/SpecialProjectsPage";
import DeliveryPage from "./pages/delivery-page/DeliveryPage";
import UsersPage from "./pages/users-page/UsersPage";
import RolesPage from "./pages/roles-page/RolesPage";
import CompanyPage from "./pages/company-page/CompanyPage";
import StoragePage from "./pages/storage-page/StoragePage";
import MaterialsPage from "./pages/materials-page/MaterialsPage";
import SettingsPage from "./pages/settings-page/SettingsPage";
import ProfilePage from "./pages/profile-page/ProfilePage";
import LoginPage from "./pages/login-page/LoginPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="items" element={<ItemsPage />} />
          <Route path="specialprojects" element={<SpecialProjectsPage />} />
          <Route path="delivery" element={<DeliveryPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
