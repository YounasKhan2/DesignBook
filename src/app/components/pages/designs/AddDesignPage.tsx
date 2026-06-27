import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import ImageUpload from "../../shared/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

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

// ── Quick-add modals ──────────────────────────────────────────────────────

function QuickAddCompany({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string) => void;
}) {
  const { addCompany, companies } = useStore();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  const reset = () => { setName(""); setNumber(""); setErrors({}); };

  const save = () => {
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
    const id = addCompany({ companyName: name.trim(), companyNumber: number.trim() });
    toast.success("Company added.");
    reset();
    onSaved(id);
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
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Al Barsha Textiles LLC"
              className={inputCls(!!errors.name)}
              autoFocus
            />
            <FieldError msg={errors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Number *</label>
            <input
              type="text"
              value={number}
              onChange={(e) => { setNumber(e.target.value); setErrors((p) => ({ ...p, number: undefined })); }}
              placeholder={`e.g. CO-${String(companies.length + 1).padStart(3, "0")}`}
              className={inputCls(!!errors.number)}
            />
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
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (id: string, dyeName: string, dyeNumber: string) => void;
}) {
  const { addDye, dyes } = useStore();
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});

  const reset = () => { setName(""); setNumber(""); setErrors({}); };

  const save = () => {
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
    const savedName = name.trim();
    const savedNumber = number.trim();
    const id = addDye({ dyeName: savedName, dyeNumber: savedNumber, images: [], coverImage: "" });
    toast.success("Dye added.");
    reset();
    onSaved(id, savedName, savedNumber);
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
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              placeholder="e.g. Midnight Blue"
              className={inputCls(!!errors.name)}
              autoFocus
            />
            <FieldError msg={errors.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
            <input
              type="text"
              value={number}
              onChange={(e) => { setNumber(e.target.value); setErrors((p) => ({ ...p, number: undefined })); }}
              placeholder={`e.g. DYE-MB-${String(dyes.length + 1).padStart(3, "0")}`}
              className={inputCls(!!errors.number)}
            />
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

// ── Main page ─────────────────────────────────────────────────────────────

type FormErrors = Partial<Record<"designName" | "designNumber" | "companyId" | "dye", string>>;

export default function AddDesignPage() {
  const navigate = useNavigate();
  const { companies, dyes, addDesign, designs } = useStore();
  const [saving, setSaving] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showAddDye, setShowAddDye] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const nextNum = `DSN-${String(designs.length + 1).padStart(3, "0")}`;

  const [form, setForm] = useState({
    designName: "",
    designNumber: nextNum,
    companyId: "",
    dyeId: "",
    dyeName: "",
    dyeNumber: "",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");

  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (key === "designName") setErrors((p) => ({ ...p, designName: undefined }));
      if (key === "designNumber") setErrors((p) => ({ ...p, designNumber: undefined }));
      if (key === "companyId") setErrors((p) => ({ ...p, companyId: undefined }));
    };

  const handleDyeChange = (dyeId: string) => {
    const dye = dyes.find((d) => d.id === dyeId);
    setForm((prev) => ({
      ...prev,
      dyeId,
      dyeName: dye?.dyeName ?? "",
      dyeNumber: dye?.dyeNumber ?? "",
    }));
    setErrors((p) => ({ ...p, dye: undefined }));
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

    const hasDye = form.dyeId || (form.dyeName.trim() && form.dyeNumber.trim());
    if (!hasDye) e.dye = "Please select a dye or enter a dye name and number.";

    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const id = addDesign({
      ...form,
      images,
      coverImage: coverImage || images[0] || "",
    });
    setSaving(false);
    toast.success("Design saved successfully.");
    navigate(`/app/designs/${id}`);
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Add Design</h1>
        <p className="text-sm text-gray-500 mt-0.5">Save a new design to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Name *</label>
            <input
              type="text"
              value={form.designName}
              onChange={set("designName")}
              placeholder="e.g. Al Wasl Abaya Collection"
              className={inputCls(!!errors.designName)}
            />
            <FieldError msg={errors.designName} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Number *</label>
            <input
              type="text"
              value={form.designNumber}
              onChange={set("designNumber")}
              placeholder="e.g. DSN-001"
              className={inputCls(!!errors.designNumber)}
            />
            <FieldError msg={errors.designNumber} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Describe this design — fabric, embroidery, occasion…"
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none"
            />
          </div>
        </section>

        {/* Company & Dye */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Dye</h2>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
            <div className="flex gap-2">
              <select
                value={form.companyId}
                onChange={set("companyId")}
                className={selectCls(!!errors.companyId)}
              >
                <option value="">Select company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddCompany(true)}
                className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all shrink-0"
                title="Add new company"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">New</span>
              </button>
            </div>
            <FieldError msg={errors.companyId} />
          </div>

          {/* Dye */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye *</label>
            <div className="flex gap-2">
              <select
                value={form.dyeId}
                onChange={(e) => handleDyeChange(e.target.value)}
                className={selectCls(!!errors.dye)}
              >
                <option value="">Select dye…</option>
                {dyes.map((d) => (
                  <option key={d.id} value={d.id}>{d.dyeName} · {d.dyeNumber}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAddDye(true)}
                className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all shrink-0"
                title="Add new dye"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">New</span>
              </button>
            </div>
            <FieldError msg={errors.dye} />
          </div>

          {/* Manual dye entry when nothing selected from list */}
          {!form.dyeId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name (manual)</label>
                <input
                  type="text"
                  value={form.dyeName}
                  onChange={(e) => { set("dyeName")(e); setErrors((p) => ({ ...p, dye: undefined })); }}
                  placeholder="e.g. Jet Black"
                  className={inputCls(!!errors.dye && !form.dyeName.trim())}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number (manual)</label>
                <input
                  type="text"
                  value={form.dyeNumber}
                  onChange={(e) => { set("dyeNumber")(e); setErrors((p) => ({ ...p, dye: undefined })); }}
                  placeholder="e.g. DYE-BK-001"
                  className={inputCls(!!errors.dye && !form.dyeNumber.trim())}
                />
              </div>
            </div>
          )}
        </section>

        {/* Images */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Design Images</h2>
          <ImageUpload
            images={images}
            coverImage={coverImage}
            onImagesChange={setImages}
            onCoverChange={setCoverImage}
          />
        </section>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#1a3461" }}
          >
            {saving ? "Saving…" : "Save Design"}
          </button>
        </div>
      </form>

      <QuickAddCompany
        open={showAddCompany}
        onClose={() => setShowAddCompany(false)}
        onSaved={(id) => {
          setForm((prev) => ({ ...prev, companyId: id }));
          setErrors((p) => ({ ...p, companyId: undefined }));
          setShowAddCompany(false);
        }}
      />
      <QuickAddDye
        open={showAddDye}
        onClose={() => setShowAddDye(false)}
        onSaved={(id, dyeName, dyeNumber) => {
          setForm((prev) => ({ ...prev, dyeId: id, dyeName, dyeNumber }));
          setErrors((p) => ({ ...p, dye: undefined }));
          setShowAddDye(false);
        }}
      />
    </div>
  );
}
