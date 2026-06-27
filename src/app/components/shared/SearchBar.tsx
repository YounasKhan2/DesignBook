import { useNavigate } from "react-router";
import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
  onClick?: () => void;
  value?: string;
  onChange?: (v: string) => void;
  autoFocus?: boolean;
}

export default function SearchBar({ placeholder = "Search designs, companies, dyes…", onClick, value, onChange, autoFocus }: Props) {
  const navigate = useNavigate();

  if (onClick || (!onChange && !value)) {
    return (
      <button
        onClick={onClick ?? (() => navigate("/app/search"))}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-400 text-sm hover:border-gray-300 hover:shadow-sm transition-all text-left"
      >
        <Search className="w-4 h-4 shrink-0" />
        {placeholder}
      </button>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        autoFocus={autoFocus}
      />
    </div>
  );
}
