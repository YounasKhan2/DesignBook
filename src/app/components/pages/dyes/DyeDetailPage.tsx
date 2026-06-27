import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Edit, Trash2, ChevronLeft, Images } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import DesignCard from "../../shared/DesignCard";
import ConfirmDialog from "../../shared/ConfirmDialog";
import EmptyState from "../../shared/EmptyState";
import ImageUpload from "../../shared/ImageUpload";
import { Layers } from "lucide-react";
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
  return `w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#1a3461] focus:ring-[#1a3461]/10"
  }`;
}

export default function DyeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDyeById, getDesignsByDye, getCompanyById, deleteDye, updateDye, dyes } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [editErrors, setEditErrors] = useState<Partial<Record<"dyeName" | "dyeNumber", string>>>({});

  const dye = getDyeById(id ?? "");
  const designs = getDesignsByDye(id ?? "");

  const [editForm, setEditForm] = useState({
    dyeName: dye?.dyeName ?? "",
    dyeNumber: dye?.dyeNumber ?? "",
    description: dye?.description ?? "",
    images: dye?.images ?? ([] as string[]),
    coverImage: dye?.coverImage ?? "",
  });

  if (!dye) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 mb-4">Dye not found.</p>
        <button
          onClick={() => navigate("/app/dyes")}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: "#1a3461" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dyes
        </button>
      </div>
    );
  }

  const dyeImages = dye.images ?? [];
  const displayImages = dyeImages.length > 0
    ? dyeImages
    : dye.coverImage
      ? [dye.coverImage]
      : [];

  const handleDelete = () => {
    deleteDye(dye.id);
    toast.success("Dye deleted.");
    navigate("/app/dyes");
  };

  const setEdit = (key: "dyeName" | "dyeNumber" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [key]: e.target.value }));
      setEditErrors((p) => ({ ...p, [key]: undefined }));
    };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="md:grid md:grid-cols-[1fr_360px] min-h-screen">
        {/* Left: image gallery */}
        <div className="md:sticky md:top-0 md:h-screen flex flex-col">
          {/* Main image */}
          <div className="relative flex-1 bg-gray-100 overflow-hidden min-h-[55vw] md:min-h-0">
            {displayImages.length > 0 ? (
              <img
                src={displayImages[activeImg] ?? displayImages[0]}
                alt={dye.dyeName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Images className="w-16 h-16 text-gray-300" />
                <p className="text-sm text-gray-400">No images added yet</p>
              </div>
            )}

            {displayImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur">
                {activeImg + 1} / {displayImages.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="flex gap-2 p-3 bg-white border-t border-gray-100 overflow-x-auto">
              {displayImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                    i === activeImg ? "border-[#1a3461]" : "border-transparent"
                  }`}
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="p-5 md:p-8 space-y-5 border-l border-gray-100 bg-white min-h-full">
          <div>
            <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wider mb-1">
              {dye.dyeNumber}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">
              {dye.dyeName}
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditForm({
                    dyeName: dye.dyeName,
                    dyeNumber: dye.dyeNumber,
                    description: dye.description ?? "",
                    images: dye.images,
                    coverImage: dye.coverImage,
                  });
                  setActiveImg(0);
                  setShowEdit(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: "#1a3461" }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 text-sm font-medium border border-red-200 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {dye.description && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{dye.description}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Added</span>
              <span>{new Date(dye.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Images</span>
              <span>{displayImages.length} photo{displayImages.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Used in</span>
              <span style={{ color: "#1a3461", fontWeight: 500 }}>{designs.length} design{designs.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Linked Designs */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Designs using this dye ({designs.length})
            </h2>
            {designs.length === 0 ? (
              <EmptyState
                icon={Layers}
                title="No designs yet"
                description="Designs linked to this dye will appear here."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {designs.map((d) => {
                  const company = getCompanyById(d.companyId);
                  return (
                    <DesignCard key={d.id} design={d} companyName={company?.companyName} />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(v) => !v && setShowEdit(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dye</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name *</label>
              <input type="text" value={editForm.dyeName} onChange={setEdit("dyeName")}
                className={inputCls(!!editErrors.dyeName)} />
              <FieldError msg={editErrors.dyeName} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
              <input type="text" value={editForm.dyeNumber} onChange={setEdit("dyeNumber")}
                className={inputCls(!!editErrors.dyeNumber)} />
              <FieldError msg={editErrors.dyeNumber} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={editForm.description} onChange={setEdit("description")} rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dye Images</label>
              <ImageUpload
                images={editForm.images}
                coverImage={editForm.coverImage}
                onImagesChange={(imgs) => setEditForm((prev) => ({ ...prev, images: imgs }))}
                onCoverChange={(url) => setEditForm((prev) => ({ ...prev, coverImage: url }))}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const e: typeof editErrors = {};
                  if (!editForm.dyeName.trim()) e.dyeName = "Dye name is required.";
                  if (!editForm.dyeNumber.trim()) {
                    e.dyeNumber = "Dye number is required.";
                  } else {
                    const norm = editForm.dyeNumber.trim().toLowerCase();
                    const dup = dyes.find((d) => d.id !== dye.id && d.dyeNumber.toLowerCase() === norm);
                    if (dup) e.dyeNumber = `Dye number "${editForm.dyeNumber.trim()}" is already used. Choose a different number.`;
                  }
                  if (Object.keys(e).length) { setEditErrors(e); return; }
                  updateDye(dye.id, editForm);
                  setShowEdit(false);
                  setEditErrors({});
                  toast.success("Dye updated.");
                }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
                style={{ backgroundColor: "#1a3461" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this dye?"
        description={`"${dye.dyeName}" will be permanently removed from your dye references.`}
        confirmLabel="Delete Dye"
      />
    </div>
  );
}
