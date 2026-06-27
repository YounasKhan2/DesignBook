import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import CompanyCard from "../../shared/CompanyCard";
import EmptyState from "../../shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import type { Company } from "../../../types";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function inputCls(hasError?: boolean) {
  return `w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

function CompanyForm({
  existingCompanies,
  excludeId,
  onSave,
  onCancel,
}: {
  existingCompanies: Company[];
  excludeId?: string;
  onSave: (data: { companyName: string; companyNumber: string; contactPerson: string; phone: string; notes: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ companyName: "", companyNumber: "", contactPerson: "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<"companyName" | "companyNumber", string>>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const save = () => {
    const e: typeof errors = {};
    if (!form.companyName.trim()) e.companyName = "Company name is required.";
    if (!form.companyNumber.trim()) {
      e.companyNumber = "Company number is required.";
    } else {
      const norm = form.companyNumber.trim().toLowerCase();
      const dup = existingCompanies.find(
        (c) => c.id !== excludeId && c.companyNumber.toLowerCase() === norm
      );
      if (dup) e.companyNumber = `Company number "${form.companyNumber.trim()}" is already used. Choose a different number.`;
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
        <input type="text" value={form.companyName} onChange={set("companyName")}
          placeholder="e.g. Al Barsha Textiles LLC" className={inputCls(!!errors.companyName)} autoFocus />
        <FieldError msg={errors.companyName} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Number *</label>
        <input type="text" value={form.companyNumber} onChange={set("companyNumber")}
          placeholder={`e.g. CO-${String(existingCompanies.length + 1).padStart(3, "0")}`}
          className={inputCls(!!errors.companyNumber)} />
        <FieldError msg={errors.companyNumber} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Person</label>
          <input type="text" value={form.contactPerson} onChange={set("contactPerson")}
            placeholder="Full name" className={inputCls()} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input type="tel" value={form.phone} onChange={set("phone")}
            placeholder="+971-4-…" className={inputCls()} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={set("notes")} rows={2}
          placeholder="Any additional notes…"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button type="button" onClick={save}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: "#1a3461" }}>
          Save
        </button>
      </div>
    </div>
  );
}

export default function CompaniesPage() {
  const { companies, addCompany, getDesignsByCompany } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () => companies.filter(
      (c) => !search ||
        c.companyName.toLowerCase().includes(search.toLowerCase()) ||
        c.companyNumber.toLowerCase().includes(search.toLowerCase()) ||
        (c.contactPerson ?? "").toLowerCase().includes(search.toLowerCase())
    ),
    [companies, search]
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{companies.length} companies</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: "#1a3461" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Company</span>
        </button>
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search companies…"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? "No companies found" : "No companies yet"}
          description={search ? "Try a different search term." : "Add your first company to get started."}
          action={
            !search ? (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#1a3461" }}
              >
                <Plus className="w-4 h-4" />
                Add Company
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              designCount={getDesignsByCompany(company.id).length}
            />
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(v) => !v && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
          </DialogHeader>
          <CompanyForm
            existingCompanies={companies}
            onSave={(data) => {
              addCompany(data);
              setShowAdd(false);
              toast.success("Company added.");
            }}
            onCancel={() => setShowAdd(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
