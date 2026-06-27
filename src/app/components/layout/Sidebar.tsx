import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Layers,
  Building2,
  Droplets,
  Search,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "sonner";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/app" },
  { label: "Designs", icon: Layers, to: "/app/designs" },
  { label: "Companies", icon: Building2, to: "/app/companies" },
  { label: "Dyes", icon: Droplets, to: "/app/dyes" },
  { label: "Search", icon: Search, to: "/app/search" },
  { label: "Settings", icon: Settings, to: "/app/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const ownerName =
    profile?.owner_name ??
    String(user?.user_metadata?.owner_name ?? user?.user_metadata?.ownerName ?? "Owner");
  const initial = ownerName.trim().charAt(0).toUpperCase() || "O";

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out. See you soon!");
      navigate("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out. Please try again.";
      toast.error(message);
    }
  };

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col z-30"
      style={{ backgroundColor: "#1a3461" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#10b981" }}>
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-lg tracking-tight"
          style={{ fontFamily: "Inter, sans-serif" }}>
          DesignBook
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/app"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              )
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: "#10b981" }}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{ownerName}</p>
            <p className="text-white/50 text-xs truncate">Owner</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 w-full transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
