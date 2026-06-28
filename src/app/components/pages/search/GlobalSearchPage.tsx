import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Layers, Building2, Droplets, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  loadSearchIndex,
  searchIndex,
  type SearchIndex,
} from "../../../services/searchService";
import { getDesignErrorMessage } from "../../../services/designsService";

export default function GlobalSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchIndex>({ designs: [], companies: [], dyes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setIndex(await loadSearchIndex());
      } catch (error) {
        toast.error(getDesignErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const q = query.toLowerCase().trim();
  const results = useMemo(() => searchIndex(index, query), [index, query]);
  const total = results.designs.length + results.companies.length + results.dyes.length;
  const hasQuery = q.length > 0;
  const quickHints = useMemo(
    () =>
      Array.from(
        new Set([
          index.designs[0]?.designNumber,
          index.companies[0]?.companyName,
          index.dyes[0]?.dyeName,
          index.dyes[0]?.dyeNumber,
        ].filter(Boolean) as string[])
      ).slice(0, 4),
    [index]
  );

  return (
    <div className="p-5 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Search</h1>
        <p className="text-sm text-gray-500">Find anything across your catalog instantly.</p>
      </div>

      {/* Search input */}
      <div className="relative mb-7">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search designs, companies, dyes..."
          autoFocus
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all shadow-sm"
        />
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Loading search data...</p>
        </div>
      )}

      {/* Empty / placeholder state */}
      {!loading && !hasQuery && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#1a346110" }}>
            <Search className="w-7 h-7" style={{ color: "#1a3461" }} />
          </div>
          <p className="font-medium text-gray-700 mb-1">Search your entire catalog</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Type a design name, number, company name, dye name, or any keyword.
          </p>
          {quickHints.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {quickHints.map((hint) => (
                <button
                  key={hint}
                  onClick={() => setQuery(hint)}
                  className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-500 hover:border-[#1a3461]/30 hover:text-[#1a3461] transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && hasQuery && total === 0 && (
        <div className="text-center py-12">
          <p className="font-medium text-gray-700 mb-1">No results for "{query}"</p>
          <p className="text-sm text-gray-400">Try a different keyword or check the spelling.</p>
        </div>
      )}

      {/* Results */}
      {!loading && hasQuery && total > 0 && (
        <div className="space-y-7">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{total}</span> result{total !== 1 ? "s" : ""} found
          </p>

          {/* Designs */}
          {results.designs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4" style={{ color: "#1a3461" }} />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Designs ({results.designs.length})
                </h2>
              </div>
              <div className="space-y-2">
                {results.designs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => navigate(`/app/designs/${d.id}`)}
                    className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm hover:border-gray-200 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {d.coverImage && (
                        <img
                          src={d.coverImage}
                          alt={d.designName}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#10b981] font-medium">{d.designNumber}</p>
                      <p className="font-semibold text-gray-900 truncate">{d.designName}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {d.companyName ?? "-"} - {d.dyeName} - {d.dyeNumber}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Companies */}
          {results.companies.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4" style={{ color: "#1a3461" }} />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Companies ({results.companies.length})
                </h2>
              </div>
              <div className="space-y-2">
                {results.companies.map((c) => {
                  const initials = c.companyName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/app/companies/${c.id}`)}
                      className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm hover:border-gray-200 transition-all text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
                        style={{ backgroundColor: "#1a3461" }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.companyName}</p>
                        <p className="text-xs text-gray-400">
                          {c.companyNumber}{c.contactPerson ? ` - ${c.contactPerson}` : ""}{c.phone ? ` - ${c.phone}` : ""}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Dyes */}
          {results.dyes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-4 h-4" style={{ color: "#1a3461" }} />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Dyes ({results.dyes.length})
                </h2>
              </div>
              <div className="space-y-2">
                {results.dyes.map((d) => {
                  return (
                    <button
                      key={d.id}
                      onClick={() => navigate(`/app/dyes/${d.id}`)}
                      className="w-full flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-sm hover:border-gray-200 transition-all text-left"
                    >
                      <div
                        className="w-12 h-12 rounded-xl shrink-0 border border-black/5 overflow-hidden bg-gray-100 flex items-center justify-center"
                      >
                        {d.coverImage && (
                          <img
                            src={d.coverImage}
                            alt={d.dyeName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        )}
                        {!d.coverImage && <Droplets className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{d.dyeName}</p>
                        <p className="text-xs text-gray-400">{d.dyeNumber}</p>
                        {d.description && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">{d.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
