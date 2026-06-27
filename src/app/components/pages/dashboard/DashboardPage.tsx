import { useNavigate } from "react-router";
import { Layers, Building2, Droplets, Plus } from "lucide-react";
import { useStore } from "../../../hooks/useStore";
import StatCard from "../../shared/StatCard";
import SearchBar from "../../shared/SearchBar";
import DesignCard from "../../shared/DesignCard";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { designs, companies, dyes, getCompanyById } = useStore();

  const recentDesigns = designs.slice(0, 6);
  const today = new Date().toLocaleDateString("en-AE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const QUICK_ACTIONS = [
    {
      label: "Add Design",
      icon: Layers,
      color: "#1a3461",
      to: "/app/designs/new",
    },
    {
      label: "Add Company",
      icon: Building2,
      color: "#10b981",
      to: "/app/companies",
    },
    {
      label: "Add Dye",
      icon: Droplets,
      color: "#7c3aed",
      to: "/app/dyes",
    },
  ];

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-7">
        <p className="text-sm text-gray-400 mb-0.5">{today}</p>
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, Mohammed{" "}
          <span className="text-[#10b981]">👋</span>
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Here's a snapshot of your design workspace.
        </p>
      </div>

      {/* Search */}
      <div className="mb-7">
        <SearchBar />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <StatCard
          label="Total Designs"
          value={designs.length}
          icon={Layers}
          accent="#1a3461"
        />
        <StatCard
          label="Companies"
          value={companies.length}
          icon={Building2}
          accent="#10b981"
        />
        <StatCard
          label="Dyes"
          value={dyes.length}
          icon={Droplets}
          accent="#7c3aed"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, color, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2.5 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
              >
                <Plus className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-gray-600">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Designs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Designs</h2>
          <button
            onClick={() => navigate("/app/designs")}
            className="text-xs text-[#10b981] font-medium hover:underline"
          >
            View all
          </button>
        </div>

        {recentDesigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1a346110" }}>
              <Layers className="w-6 h-6" style={{ color: "#1a3461" }} />
            </div>
            <p className="font-medium text-gray-800 mb-1">No designs yet</p>
            <p className="text-sm text-gray-500 max-w-xs mb-5">
              Add your first design to start building your catalog.
            </p>
            <button
              onClick={() => navigate("/app/designs/new")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: "#1a3461" }}
            >
              <Plus className="w-4 h-4" />
              Add First Design
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentDesigns.map((design) => {
              const company = getCompanyById(design.companyId);
              return (
                <DesignCard
                  key={design.id}
                  design={design}
                  companyName={company?.companyName}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
