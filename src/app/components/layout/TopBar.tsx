import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, BookOpen } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/designs": "Designs",
  "/app/designs/new": "Add Design",
  "/app/companies": "Companies",
  "/app/dyes": "Dyes",
  "/app/search": "Search",
  "/app/settings": "Settings",
};

function getTitle(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.endsWith("/edit")) return "Edit Design";
  if (pathname.startsWith("/app/designs/")) return "Design Details";
  if (pathname.startsWith("/app/companies/")) return "Company Details";
  if (pathname.startsWith("/app/dyes/")) return "Dye Details";
  return "DesignBook";
}

function isRoot(pathname: string) {
  return ["/app", "/app/designs", "/app/companies", "/app/dyes", "/app/search", "/app/settings"].includes(pathname);
}

export default function TopBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const title = getTitle(pathname);
  const showBack = !isRoot(pathname);

  return (
    <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 shrink-0">
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      ) : (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#1a3461" }}>
          <BookOpen className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <h1 className="font-semibold text-gray-900">{title}</h1>
    </header>
  );
}
