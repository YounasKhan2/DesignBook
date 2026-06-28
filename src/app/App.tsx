import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import PWAInstallBanner from "./components/shared/PWAInstallBanner";
import { queryClient } from "./lib/queryClient";

import LandingPage from "./components/pages/landing/LandingPage";
import LoginPage from "./components/pages/auth/LoginPage";
import SignUpPage from "./components/pages/auth/SignUpPage";
import ForgotPasswordPage from "./components/pages/auth/ForgotPasswordPage";
import AppShell from "./components/layout/AppShell";
import DashboardPage from "./components/pages/dashboard/DashboardPage";
import DesignsGalleryPage from "./components/pages/designs/DesignsGalleryPage";
import AddDesignPage from "./components/pages/designs/AddDesignPage";
import DesignDetailPage from "./components/pages/designs/DesignDetailPage";
import EditDesignPage from "./components/pages/designs/EditDesignPage";
import CompaniesPage from "./components/pages/companies/CompaniesPage";
import CompanyDetailPage from "./components/pages/companies/CompanyDetailPage";
import DyesPage from "./components/pages/dyes/DyesPage";
import DyeDetailPage from "./components/pages/dyes/DyeDetailPage";
import GlobalSearchPage from "./components/pages/search/GlobalSearchPage";
import SettingsPage from "./components/pages/settings/SettingsPage";

function PublicLayout() {
  return <Outlet />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f6f9]" style={{ fontFamily: "Inter, sans-serif" }}>
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl mx-auto mb-3 animate-pulse" style={{ backgroundColor: "#1a3461" }} />
        <p className="text-sm text-gray-500">Checking your session...</p>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <AppShell />;
}

function GuestRoute() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to="/app" replace />;
  return <Outlet />;
}

function StartRoute() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return <Navigate to={session ? "/app" : "/"} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "start", Component: StartRoute },
      {
        Component: GuestRoute,
        children: [
          { path: "login", Component: LoginPage },
          { path: "signup", Component: SignUpPage },
        ],
      },
      { path: "forgot-password", Component: ForgotPasswordPage },
    ],
  },
  {
    path: "/app",
    Component: ProtectedRoute,
    children: [
      { index: true, Component: DashboardPage },
      { path: "designs", Component: DesignsGalleryPage },
      { path: "designs/new", Component: AddDesignPage },
      { path: "designs/:id", Component: DesignDetailPage },
      { path: "designs/:id/edit", Component: EditDesignPage },
      { path: "companies", Component: CompaniesPage },
      { path: "companies/:id", Component: CompanyDetailPage },
      { path: "dyes", Component: DyesPage },
      { path: "dyes/:id", Component: DyeDetailPage },
      { path: "search", Component: GlobalSearchPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <PWAInstallBanner />
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}
