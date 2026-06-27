import { createBrowserRouter, RouterProvider, Outlet } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { StoreProvider } from "./hooks/useStore";

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

const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "signup", Component: SignUpPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
    ],
  },
  {
    path: "/app",
    Component: AppShell,
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
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}
