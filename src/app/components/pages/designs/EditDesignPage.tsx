import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import ImageUpload from "../../shared/ImageUpload";

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
  return `w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

type FormErrors = Partial<Record<"designName" | "designNumber" | "companyId" | "dye", string>>;

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDesignById, companies, dyes, designs, updateDesign } = useStore();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const design = getDesignById(id ?? "");

  const [form, setForm] = useState({
    designName: "",
    designNumber: "",
    companyId: "",
    dyeId: "",
    dyeName: "",
    dyeNumber: "",
    description: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (design) {
      setForm({
        designName: design.designName,
        designNumber: design.designNumber,
        companyId: design.companyId,
        dyeId: design.dyeId,
        dyeName: design.dyeName,
        dyeNumber: design.dyeNumber,
        description: design.description,
      });
      setImages(design.images);
      setCoverImage(design.coverImage);
    }
  }, [design]);

  if (!design) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 mb-4">Design not found.</p>
        <button
          onClick={() => navigate("/app/designs")}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: "#1a3461" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Designs
        </button>
      </div>
    );
  }

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
      // Exclude the current design from the duplicate check
      const dup = designs.find(
        (d) => d.id !== design.id && d.designNumber.trim().toLowerCase() === trimNum.toLowerCase()
      );
      if (dup) e.designNumber = `Design number "${trimNum}" is already used by another design. Choose a different number.`;
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
    updateDesign(design.id, {
      ...form,
      images,
      coverImage: coverImage || images[0] || "",
    });
    setSaving(false);
    toast.success("Design updated successfully.");
    navigate(`/app/designs/${design.id}`);
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Edit Design</h1>
        <p className="text-sm text-gray-500 mt-0.5 truncate">Editing: {design.designName}</p>
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
              className={inputCls(!!errors.designNumber)}
            />
            <FieldError msg={errors.designNumber} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none"
            />
          </div>
        </section>

        {/* Company & Dye */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Dye</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
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
            <FieldError msg={errors.companyId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye *</label>
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
            <FieldError msg={errors.dye} />
          </div>

          {!form.dyeId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name</label>
                <input
                  type="text"
                  value={form.dyeName}
                  onChange={(e) => { set("dyeName")(e); setErrors((p) => ({ ...p, dye: undefined })); }}
                  className={inputCls(!!errors.dye && !form.dyeName.trim())}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number</label>
                <input
                  type="text"
                  value={form.dyeNumber}
                  onChange={(e) => { set("dyeNumber")(e); setErrors((p) => ({ ...p, dye: undefined })); }}
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
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
