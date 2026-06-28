import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "../../shared/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import type { Company, Dye } from "../../../types";
import { getCompanyErrorMessage } from "../../../services/companiesService";
import { getDyeErrorMessage } from "../../../services/dyesService";
import { getDesignErrorMessage } from "../../../services/designsService";
import {
  useCompanies,
  useCreateCompany,
  useCreateDesign,
  useCreateDye,
  useDesigns,
  useDyes,
} from "../../../hooks/useCatalogQueries";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function inputCls(hasError?: boolean) {
  return `w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

function selectCls(hasError?: boolean) {
  return `flex-1 px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

function QuickAddCompany({
  open,
  companies,
  onClose,
  onSaved,
}: {
  open: boolean;
  companies: Company[];
  onClose: () => void;
  onSaved: (company: Company) => void;
}) {
  const createCompanyMutation = useCreateCompany();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  const reset = () => { setName(""); setNumber(""); setErrors({}); };

  const save = async () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Company name is required.";
    if (!number.trim()) {
      e.number = "Company number is required.";
    } else {
      const norm = number.trim().toLowerCase();
      const dup = companies.find((c) => c.companyNumber.toLowerCase() === norm);
      if (dup) e.number = `Company number "${number.trim()}" is already used. Choose a different number.`;
    }
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      const company = await createCompanyMutation.mutateAsync({ companyName: name.trim(), companyNumber: number.trim() });
      toast.success("Company added.");
      reset();
      onSaved(company);
    } catch (error) {
      toast.error(getCompanyErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Client or supplier name" className={inputCls(!!errors.name)} autoFocus />
            <FieldError msg={errors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Number *</label>
            <input value={number} onChange={(e) => { setNumber(e.target.value); setErrors((p) => ({ ...p, number: undefined })); }}
              placeholder={`e.g. CO-${String(companies.length + 1).padStart(3, "0")}`} className={inputCls(!!errors.number)} />
            <FieldError msg={errors.number} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { reset(); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ backgroundColor: "#1a3461" }}>
              Save Company
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuickAddDye({
  open,
  dyes,
  onClose,
  onSaved,
}: {
  open: boolean;
  dyes: Dye[];
  onClose: () => void;
  onSaved: (dye: Dye) => void;
}) {
  const createDyeMutation = useCreateDye();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  const reset = () => { setName(""); setNumber(""); setErrors({}); };

  const save = async () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Dye name is required.";
    if (!number.trim()) {
      e.number = "Dye number is required.";
    } else {
      const norm = number.trim().toLowerCase();
      const dup = dyes.find((d) => d.dyeNumber.toLowerCase() === norm);
      if (dup) e.number = `Dye number "${number.trim()}" is already used. Choose a different number.`;
    }
    if (Object.keys(e).length) { setErrors(e); return; }

    try {
      const dye = await createDyeMutation.mutateAsync({
        input: { dyeName: name.trim(), dyeNumber: number.trim(), coverImage: "" },
        images: [],
      });
      if (!dye) return;
      toast.success("Dye added.");
      reset();
      onSaved(dye);
    } catch (error) {
      toast.error(getDyeErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Dye</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name *</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Midnight Blue" className={inputCls(!!errors.name)} autoFocus />
            <FieldError msg={errors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
            <input value={number} onChange={(e) => { setNumber(e.target.value); setErrors((p) => ({ ...p, number: undefined })); }}
              placeholder={`e.g. DYE-MB-${String(dyes.length + 1).padStart(3, "0")}`} className={inputCls(!!errors.number)} />
            <FieldError msg={errors.number} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => { reset(); onClose(); }} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all" style={{ backgroundColor: "#1a3461" }}>
              Save Dye
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type FormErrors = Partial<Record<"designName" | "designNumber" | "companyId" | "dye", string>>;

export default function AddDesignPage() {
  const navigate = useNavigate();
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError, error: companiesLoadError } = useCompanies();
  const { data: dyes = [], isLoading: dyesLoading, isError: dyesError, error: dyesLoadError } = useDyes();
  const { data: designs = [], isLoading: designsLoading, isError: designsError, error: designsLoadError } = useDesigns();
  const createDesignMutation = useCreateDesign();
  const [saving, setSaving] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddDye, setShowAddDye] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const loading = companiesLoading || dyesLoading || designsLoading;
  const suggestedNumberApplied = useRef(false);

  const [form, setForm] = useState({
    designName: "",
    designNumber: "DSN-001",
    companyId: "",
    dyeId: "",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (companiesError) toast.error(getCompanyErrorMessage(companiesLoadError));
    if (dyesError) toast.error(getDyeErrorMessage(dyesLoadError));
    if (designsError) toast.error(getDesignErrorMessage(designsLoadError));
  }, [companiesError, companiesLoadError, designsError, designsLoadError, dyesError, dyesLoadError]);

  useEffect(() => {
    if (!loading && !suggestedNumberApplied.current) {
      suggestedNumberApplied.current = true;
      setForm((prev) => ({
        ...prev,
        designNumber: `DSN-${String(designs.length + 1).padStart(3, "0")}`,
      }));
    }
  }, [designs.length, loading]);

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (key === "designName") setErrors((p) => ({ ...p, designName: undefined }));
      if (key === "designNumber") setErrors((p) => ({ ...p, designNumber: undefined }));
      if (key === "companyId") setErrors((p) => ({ ...p, companyId: undefined }));
      if (key === "dyeId") setErrors((p) => ({ ...p, dye: undefined }));
    };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.designName.trim()) e.designName = "Design name is required.";

    const trimNum = form.designNumber.trim();
    if (!trimNum) {
      e.designNumber = "Design number is required.";
    } else {
      const dup = designs.find((d) => d.designNumber.trim().toLowerCase() === trimNum.toLowerCase());
      if (dup) e.designNumber = `Design number "${trimNum}" is already used. Choose a different number.`;
    }

    if (!form.companyId) e.companyId = "Please select a company.";
    if (!form.dyeId) e.dye = "Please select a dye.";

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const design = await createDesignMutation.mutateAsync({
        input: {
          ...form,
          coverImage: coverImage || images[0] || "",
        },
        images,
      });
      toast.success("Design saved successfully.");
      navigate(`/app/designs/${design?.id}`);
    } catch (error) {
      toast.error(getDesignErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Add Design</h1>
        <p className="text-sm text-gray-500 mt-0.5">Save a new design to your catalog.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-sm text-gray-500">Loading design options...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Name *</label>
              <input value={form.designName} onChange={set("designName")} placeholder="e.g. Al Wasl Abaya Collection" className={inputCls(!!errors.designName)} />
              <FieldError msg={errors.designName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Number *</label>
              <input value={form.designNumber} onChange={set("designNumber")} placeholder="e.g. DSN-001" className={inputCls(!!errors.designNumber)} />
              <FieldError msg={errors.designNumber} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={set("description")} placeholder="Describe this design..." rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none" />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Dye</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
              <div className="flex gap-2">
                <select value={form.companyId} onChange={set("companyId")} className={selectCls(!!errors.companyId)}>
                  <option value="">Select company...</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
                <button type="button" onClick={() => setShowAddCompany(true)} className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all shrink-0" title="Add new company">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">New</span>
                </button>
              </div>
              <FieldError msg={errors.companyId} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye *</label>
              <div className="flex gap-2">
                <select value={form.dyeId} onChange={set("dyeId")} className={selectCls(!!errors.dye)}>
                  <option value="">Select dye...</option>
                  {dyes.map((d) => <option key={d.id} value={d.id}>{d.dyeName} - {d.dyeNumber}</option>)}
                </select>
                <button type="button" onClick={() => setShowAddDye(true)} className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all shrink-0" title="Add new dye">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">New</span>
                </button>
              </div>
              <FieldError msg={errors.dye} />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Design Images</h2>
            <ImageUpload images={images} coverImage={coverImage} onImagesChange={setImages} onCoverChange={setCoverImage} />
          </section>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "#1a3461" }}>
              {saving ? "Saving..." : "Save Design"}
            </button>
          </div>
        </form>
      )}

      <QuickAddCompany
        open={showAddCompany}
        companies={companies}
        onClose={() => setShowAddCompany(false)}
        onSaved={(company) => {
          setForm((prev) => ({ ...prev, companyId: company.id }));
          setErrors((p) => ({ ...p, companyId: undefined }));
          setShowAddCompany(false);
        }}
      />
      <QuickAddDye
        open={showAddDye}
        dyes={dyes}
        onClose={() => setShowAddDye(false)}
        onSaved={(dye) => {
          setForm((prev) => ({ ...prev, dyeId: dye.id }));
          setErrors((p) => ({ ...p, dye: undefined }));
          setShowAddDye(false);
        }}
      />
    </div>
  );
}
