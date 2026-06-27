import { NavLink, useNavigate } from "react-router";
import { LayoutDashboard, Layers, Plus, Search, Settings } from "lucide-react";
import { cn } from "../ui/utils";

const TABS = [
  { label: "Home", icon: LayoutDashboard, to: "/app", end: true },
  { label: "Designs", icon: Layers, to: "/app/designs", end: false },
  null, // center FAB placeholder
  { label: "Search", icon: Search, to: "/app/search", end: false },
  { label: "Settings", icon: Settings, to: "/app/settings", end: false },
];

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center"
      style={{ height: "64px", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab, idx) => {
        if (!tab) {
          return (
            <div key="fab" className="flex-1 flex justify-center items-center">
              <button
                onClick={() => navigate("/app/designs/new")}
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-white transition-transform active:scale-95"
                style={{ backgroundColor: "#10b981" }}
                aria-label="Add Design"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          );
        }
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                isActive ? "text-[#1a3461]" : "text-gray-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-[#1a3461]" : "text-gray-400"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-[#1a3461]" : "text-gray-400"
                  )}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
