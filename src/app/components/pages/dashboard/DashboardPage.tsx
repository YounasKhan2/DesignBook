import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Layers, Building2, Droplets, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks/useAuth";
import SearchBar from "../../shared/SearchBar";
import DesignCard from "../../shared/DesignCard";
import { getDesignErrorMessage } from "../../../services/designsService";
import { useDashboardSummary } from "../../../hooks/useCatalogQueries";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  to: string;
}

function StatCard({ label, value, icon: Icon, accent, to }: StatCardProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-all text-left w-full"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accent}18` }}
      >
        <Icon className="w-4.5 h-4.5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: summary = {
    counts: { designs: 0, companies: 0, dyes: 0 },
    recentDesigns: [],
  }, isLoading: loading, isError, error } = useDashboardSummary();

  const greetingName = (
    profile?.owner_name ||
    profile?.business_name ||
    String(user?.user_metadata?.owner_name ?? user?.user_metadata?.ownerName ?? "Owner")
  ).trim().split(/\s+/)[0];

  useEffect(() => {
    if (isError) toast.error(getDesignErrorMessage(error));
  }, [error, isError]);

  const today = new Date().toLocaleDateString("en-AE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const QUICK_ACTIONS = [
    { label: "Add Design", icon: Layers, color: "#1a3461", to: "/app/designs/new" },
    { label: "Add Company", icon: Building2, color: "#10b981", to: "/app/companies" },
    { label: "Add Dye", icon: Droplets, color: "#7c3aed", to: "/app/dyes" },
  ];

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <p className="text-xs text-gray-400 mb-0.5 leading-snug">{today}</p>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Good day, {greetingName || "Owner"}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Here's your design workspace at a glance.</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Designs" value={summary.counts.designs} icon={Layers} accent="#1a3461" to="/app/designs" />
        <StatCard label="Companies" value={summary.counts.companies} icon={Building2} accent="#10b981" to="/app/companies" />
        <StatCard label="Dyes" value={summary.counts.dyes} icon={Droplets} accent="#7c3aed" to="/app/dyes" />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map(({ label, icon: Icon, color, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="flex flex-col items-center gap-2 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${color}15` }}
              >
                <Plus className="w-4 h-4" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-snug px-1">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Designs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Designs</h2>
          <button
            onClick={() => navigate("/app/designs")}
            className="text-xs font-medium hover:underline"
            style={{ color: "#10b981" }}
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 flex flex-col items-center text-center px-6">
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        ) : summary.recentDesigns.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-14 flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1a346110" }}>
              <Layers className="w-5 h-5" style={{ color: "#1a3461" }} />
            </div>
            <p className="font-medium text-gray-800 mb-1 text-sm">No designs yet</p>
            <p className="text-xs text-gray-500 max-w-xs mb-4 leading-relaxed">
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
            {summary.recentDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                companyName={design.companyName}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
