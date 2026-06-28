import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import ImageUpload from "../../shared/ImageUpload";
import {
  getDesignErrorMessage,
} from "../../../services/designsService";
import { useCompanies, useDesign, useDesigns, useDyes, useUpdateDesign } from "../../../hooks/useCatalogQueries";

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
  const { data: design = null, isLoading: designLoading, isError: designError, error: designLoadError } = useDesign(id);
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError } = useCompanies();
  const { data: dyes = [], isLoading: dyesLoading, isError: dyesError } = useDyes();
  const { data: existingDesigns = [], isLoading: designsLoading, isError: designsError } = useDesigns();
  const updateDesignMutation = useUpdateDesign();
  const loading = designLoading || companiesLoading || dyesLoading || designsLoading;
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState({
    designName: "",
    designNumber: "",
    companyId: "",
    dyeId: "",
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
        description: design.description,
      });
      setImages(design.images);
      setCoverImage(design.coverImage);
    }
  }, [design]);

  useEffect(() => {
    if (designError) toast.error(getDesignErrorMessage(designLoadError));
    if (companiesError) toast.error("Unable to load companies.");
    if (dyesError) toast.error("Unable to load dyes.");
    if (designsError) toast.error("Unable to load designs.");
  }, [companiesError, designError, designLoadError, designsError, dyesError]);

  if (loading) {
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-sm text-gray-500">Loading design...</p>
        </div>
      </div>
    );
  }

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
      if (key === "dyeId") setErrors((p) => ({ ...p, dye: undefined }));
    };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.designName.trim()) e.designName = "Design name is required.";

    const trimNum = form.designNumber.trim();
    if (!trimNum) {
      e.designNumber = "Design number is required.";
    } else {
      const dup = existingDesigns.find(
        (d) => d.id !== design.id && d.designNumber.trim().toLowerCase() === trimNum.toLowerCase()
      );
      if (dup) e.designNumber = `Design number "${trimNum}" is already used by another design. Choose a different number.`;
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
      const updated = await updateDesignMutation.mutateAsync({
        id: design.id,
        input: {
          ...form,
          coverImage: coverImage || images[0] || "",
        },
        images,
      });
      toast.success("Design updated successfully.");
      navigate(`/app/designs/${updated?.id ?? design.id}`);
    } catch (error) {
      toast.error(getDesignErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Edit Design</h1>
        <p className="text-sm text-gray-500 mt-0.5 truncate">Editing: {design.designName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Name *</label>
            <input value={form.designName} onChange={set("designName")} className={inputCls(!!errors.designName)} />
            <FieldError msg={errors.designName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Number *</label>
            <input value={form.designNumber} onChange={set("designNumber")} className={inputCls(!!errors.designNumber)} />
            <FieldError msg={errors.designNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none" />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company & Dye</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
            <select value={form.companyId} onChange={set("companyId")} className={selectCls(!!errors.companyId)}>
              <option value="">Select company...</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
            <FieldError msg={errors.companyId} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye *</label>
            <select value={form.dyeId} onChange={set("dyeId")} className={selectCls(!!errors.dye)}>
              <option value="">Select dye...</option>
              {dyes.map((d) => <option key={d.id} value={d.id}>{d.dyeName} - {d.dyeNumber}</option>)}
            </select>
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
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
