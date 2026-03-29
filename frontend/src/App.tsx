import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { SubmitPropertyPage } from "@/pages/SubmitPropertyPage";

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
        aria-label="Loading"
      />
    </div>
  );
}

function ProtectedRoute() {
  const { accessToken, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { accessToken, loading } = useAuth();
  if (loading) return <PageLoading />;
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return (
    <div className="min-h-screen bg-slate-50">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/submit-property" element={<SubmitPropertyPage />} />
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
