import { useNavigate } from "react-router";
import { Images, Layers } from "lucide-react";
import type { Dye } from "../../types";

// Fallback accent colors keyed by dye number for search/list views
const DYE_COLORS: Record<string, string> = {
  "DYE-BK-001": "#1a1a1a",
  "DYE-NV-002": "#1a3461",
  "DYE-GD-003": "#c9a84c",
  "DYE-GN-004": "#10b981",
  "DYE-WH-005": "#f0ede8",
  "DYE-RD-006": "#c0392b",
  "DYE-BG-007": "#c19a6b",
  "DYE-BU-008": "#722f37",
};

export function getDyeColor(dyeNumber: string): string {
  return DYE_COLORS[dyeNumber] ?? "#94a3b8";
}

interface Props {
  dye: Dye;
  designCount?: number;
}

export default function DyeCard({ dye, designCount = 0 }: Props) {
  const navigate = useNavigate();
  const images = dye.images ?? [];
  const hasCover = !!dye.coverImage;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
      onClick={() => navigate(`/app/dyes/${dye.id}`)}
    >
      {/* Cover image or placeholder */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {hasCover ? (
          <img
            src={dye.coverImage}
            alt={dye.dyeName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.style.backgroundColor = "#f3f4f6";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl opacity-30" style={{ backgroundColor: "#1a3461" }} />
          </div>
        )}

        {/* Image count badge */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            <Images className="w-3 h-3" />
            {images.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-medium text-[#10b981] mb-0.5 tracking-wide uppercase">
          {dye.dyeNumber}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug mb-1.5">
          {dye.dyeName}
        </h3>
        <div className="flex items-center justify-between">
          {dye.description && (
            <p className="text-xs text-gray-400 truncate flex-1 mr-2">{dye.description}</p>
          )}
          <div className="flex items-center gap-1 bg-blue-50 text-[#1a3461] text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
            <Layers className="w-3 h-3" />
            {designCount}
          </div>
        </div>
      </div>
    </div>
  );
}
