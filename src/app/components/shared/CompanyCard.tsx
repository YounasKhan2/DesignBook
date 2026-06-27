import { useNavigate } from "react-router";
import { Building2, Phone, User, Layers } from "lucide-react";
import type { Company } from "../../types";

interface Props {
  company: Company;
  designCount?: number;
}

export default function CompanyCard({ company, designCount = 0 }: Props) {
  const navigate = useNavigate();
  const initials = company.companyName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => navigate(`/app/companies/${company.id}`)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
          style={{ backgroundColor: "#1a3461" }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 leading-snug truncate">
                {company.companyName}
              </h3>
              <p className="text-xs text-[#10b981] font-medium mt-0.5">
                {company.companyNumber}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-[#1a3461] text-xs font-medium px-2 py-0.5 rounded-full shrink-0">
              <Layers className="w-3 h-3" />
              {designCount}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {company.contactPerson && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{company.contactPerson}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{company.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
