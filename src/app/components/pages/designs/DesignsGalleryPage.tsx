import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import DesignCard from "../../shared/DesignCard";
import EmptyState from "../../shared/EmptyState";
import { Layers } from "lucide-react";
import { listCompanies } from "../../../services/companiesService";
import { listDyes } from "../../../services/dyesService";
import {
  companyNameForDesign,
  getDesignErrorMessage,
  listDesigns,
  type DesignWithRelations,
} from "../../../services/designsService";
import type { Company, Dye } from "../../../types";
import { toast } from "sonner";

export default function DesignsGalleryPage() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<DesignWithRelations[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [dyes, setDyes] = useState<Dye[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("");
  const [filterDye, setFilterDye] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [nextDesigns, nextCompanies, nextDyes] = await Promise.all([
          listDesigns(),
          listCompanies(),
          listDyes(),
        ]);
        setDesigns(nextDesigns);
        setCompanies(nextCompanies);
        setDyes(nextDyes);
      } catch (error) {
        toast.error(getDesignErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    return designs.filter((d) => {
      const q = search.toLowerCase();
      const companyName = companyNameForDesign(d, companies) ?? "";
      const matchSearch =
        !q ||
        d.designName.toLowerCase().includes(q) ||
        d.designNumber.toLowerCase().includes(q) ||
        d.dyeName.toLowerCase().includes(q) ||
        companyName.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);
      const matchCompany = !filterCompany || d.companyId === filterCompany;
      const matchDye = !filterDye || d.dyeId === filterDye;
      return matchSearch && matchCompany && matchDye;
    });
  }, [companies, designs, search, filterCompany, filterDye]);

  const hasFilters = search || filterCompany || filterDye;

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Designs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{designs.length} designs in your catalog</p>
        </div>
        <button
          onClick={() => navigate("/app/designs/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
          style={{ backgroundColor: "#1a3461" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Design</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">Filter & Search</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, number, or description..."
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
          <select
            value={filterDye}
            onChange={(e) => setFilterDye(e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
          >
            <option value="">All Dyes</option>
            {dyes.map((d) => (
              <option key={d.id} value={d.id}>{d.dyeName} - {d.dyeNumber}</option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setFilterCompany(""); setFilterDye(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>

      {hasFilters && !loading && (
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-sm text-gray-500">Loading designs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={hasFilters ? "No designs match your filters" : "No designs yet"}
          description={
            hasFilters
              ? "Try adjusting your search or filters."
              : "Start by adding your first design to the catalog."
          }
          action={
            !hasFilters ? (
              <button
                onClick={() => navigate("/app/designs/new")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#1a3461" }}
              >
                <Plus className="w-4 h-4" />
                Add First Design
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((design) => (
            <DesignCard
              key={design.id}
              design={design}
              companyName={companyNameForDesign(design, companies)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
