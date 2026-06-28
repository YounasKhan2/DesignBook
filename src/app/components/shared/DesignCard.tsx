import { useNavigate } from "react-router";
import { Images, Edit } from "lucide-react";
import { cn } from "../ui/utils";
import type { Design } from "../../types";

interface Props {
  design: Design;
  companyName?: string;
}

export default function DesignCard({ design, companyName }: Props) {
  const navigate = useNavigate();

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`/app/designs/${design.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        {design.coverImage ? (
          <img
            src={design.coverImage}
            alt={design.designName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Images className="w-10 h-10 text-gray-300" />
          </div>
        )}

        {/* Image count badge */}
        {design.images.length > 1 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
            <Images className="w-3 h-3" />
            {design.images.length}
          </div>
        )}

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-end p-2 opacity-0 group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/app/designs/${design.id}/edit`);
            }}
            className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Edit design"
          >
            <Edit className="w-3.5 h-3.5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-medium text-[#10b981] mb-0.5 tracking-wide uppercase">
          {design.designNumber}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 truncate leading-snug mb-1.5">
          {design.designName}
        </h3>
        <div className="space-y-0.5">
          {companyName && (
            <p className="text-xs text-gray-500 truncate">{companyName}</p>
          )}
          <p className="text-xs text-gray-400 truncate">
            {design.dyeName} · {design.dyeNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
