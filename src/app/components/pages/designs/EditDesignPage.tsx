import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import ImageUpload from "../../shared/ImageUpload";
import { ChevronLeft } from "lucide-react";

export default function EditDesignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDesignById, companies, dyes, updateDesign } = useStore();
  const [saving, setSaving] = useState(false);

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

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleDyeChange = (dyeId: string) => {
    const dye = dyes.find((d) => d.id === dyeId);
    setForm((prev) => ({
      ...prev,
      dyeId,
      dyeName: dye?.dyeName ?? "",
      dyeNumber: dye?.dyeNumber ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.designName.trim()) {
      toast.error("Design name is required.");
      return;
    }
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Info</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Name *</label>
            <input
              type="text"
              value={form.designName}
              onChange={set("designName")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Design Number *</label>
            <input
              type="text"
              value={form.designNumber}
              onChange={set("designNumber")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
            />
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
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Company & Dye</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
            <select
              value={form.companyId}
              onChange={set("companyId")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
            >
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye</label>
            <select
              value={form.dyeId}
              onChange={(e) => handleDyeChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
            >
              <option value="">Select dye…</option>
              {dyes.map((d) => (
                <option key={d.id} value={d.id}>{d.dyeName} · {d.dyeNumber}</option>
              ))}
            </select>
          </div>

          {!form.dyeId && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name</label>
                <input
                  type="text"
                  value={form.dyeName}
                  onChange={set("dyeName")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number</label>
                <input
                  type="text"
                  value={form.dyeNumber}
                  onChange={set("dyeNumber")}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
                />
              </div>
            </div>
          )}
        </section>

        {/* Images */}
        <section className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-4">Design Images</h2>
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
