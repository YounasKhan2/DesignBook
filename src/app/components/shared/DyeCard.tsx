import { useNavigate } from "react-router";
import { Droplets, Layers } from "lucide-react";
import type { Dye } from "../../types";

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

function getDyeColor(dyeNumber: string) {
  return DYE_COLORS[dyeNumber] ?? "#94a3b8";
}

interface Props {
  dye: Dye;
  designCount?: number;
}

export default function DyeCard({ dye, designCount = 0 }: Props) {
  const navigate = useNavigate();
  const color = getDyeColor(dye.dyeNumber);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/app/dyes/${dye.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Color swatch */}
        <div
          className="w-12 h-12 rounded-xl shrink-0 border border-black/5 shadow-sm"
          style={{ backgroundColor: color }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 leading-snug truncate">
                {dye.dyeName}
              </h3>
              <p className="text-xs text-[#10b981] font-medium mt-0.5">
                {dye.dyeNumber}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-[#1a3461] text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
              <Layers className="w-3 h-3" />
              {designCount}
            </div>
          </div>

          {dye.description && (
            <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
              {dye.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { getDyeColor };
