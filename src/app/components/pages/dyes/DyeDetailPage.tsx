import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Download, Edit, ExternalLink, Trash2, ChevronLeft, Images } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../../shared/ConfirmDialog";
import EmptyState from "../../shared/EmptyState";
import ImageUpload from "../../shared/ImageUpload";
import { Layers } from "lucide-react";
import { downloadPrivateImage, openPrivateImage } from "../../../services/imageDownloadService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import type { Dye } from "../../../types";
import {
  deleteDye,
  getDyeById,
  getDyeErrorMessage,
  listDyes,
  updateDye,
} from "../../../services/dyesService";

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
  const [dye, setDye] = useState<Dye | null>(null);
  const [dyes, setDyes] = useState<Dye[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [imageAction, setImageAction] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<Partial<Record<"dyeName" | "dyeNumber", string>>>({});

  const [editForm, setEditForm] = useState({
    dyeName: "",
    dyeNumber: "",
    description: "",
    images: [] as string[],
    coverImage: "",
  });

  const loadDye = async () => {
    if (!id) {
      setDye(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [nextDye, nextDyes] = await Promise.all([
        getDyeById(id),
        listDyes(),
      ]);
      setDye(nextDye);
      setDyes(nextDyes);
      setActiveImg(0);
    } catch (error) {
      toast.error(getDyeErrorMessage(error));
      setDye(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDye();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-5 md:p-8">
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-sm text-gray-500">Loading dye...</p>
        </div>
      </div>
    );
  }

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

  const displayImages = dye.images.length > 0
    ? dye.images
    : dye.coverImage
      ? [dye.coverImage]
      : [];
  const displayImagePaths = dye.imagePaths && dye.imagePaths.length > 0
    ? dye.imagePaths
    : dye.coverImagePath
      ? [dye.coverImagePath]
      : [];
  const activeImagePath = displayImagePaths[activeImg] ?? displayImagePaths[0];

  const handleDelete = async () => {
    try {
      await deleteDye(dye.id);
      toast.success("Dye deleted.");
      navigate("/app/dyes");
    } catch (error) {
      toast.error(getDyeErrorMessage(error));
    }
  };

  const handleDownloadImage = async (storagePath: string | undefined, filenameBase: string, actionKey: string) => {
    if (!storagePath) {
      toast.error("Could not download image. Please try again.");
      return;
    }

    setImageAction(actionKey);
    try {
      await downloadPrivateImage(storagePath, filenameBase);
    } catch {
      toast.error("Could not download image. Please try again.");
    } finally {
      setImageAction(null);
    }
  };

  const handleOpenImage = async (storagePath: string | undefined, actionKey: string) => {
    if (!storagePath) {
      toast.error("Could not open image. Please try again.");
      return;
    }

    setImageAction(actionKey);
    try {
      await openPrivateImage(storagePath);
    } catch {
      toast.error("Could not open image. Please try again.");
    } finally {
      setImageAction(null);
    }
  };

  const setEdit = (key: "dyeName" | "dyeNumber" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditForm((prev) => ({ ...prev, [key]: e.target.value }));
      setEditErrors((p) => ({ ...p, [key]: undefined }));
    };

  const handleSaveEdit = async () => {
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

    try {
      const updated = await updateDye(
        dye.id,
        {
          dyeName: editForm.dyeName,
          dyeNumber: editForm.dyeNumber,
          description: editForm.description,
          coverImage: editForm.coverImage,
        },
        editForm.images
      );
      if (updated) setDye(updated);
      setShowEdit(false);
      setEditErrors({});
      setActiveImg(0);
      await loadDye();
      toast.success("Dye updated.");
    } catch (error) {
      toast.error(getDyeErrorMessage(error));
    }
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

            {activeImagePath && (
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenImage(activeImagePath, "open-active")}
                  disabled={!!imageAction}
                  aria-label="Open full image"
                  className="w-10 h-10 rounded-xl bg-white/90 text-gray-700 shadow-sm backdrop-blur flex items-center justify-center hover:bg-white disabled:opacity-60"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadImage(activeImagePath, `dye-${dye.dyeNumber}-image-${activeImg + 1}`, "download-active")}
                  disabled={!!imageAction}
                  aria-label="Download image"
                  className="w-10 h-10 rounded-xl bg-white/90 text-gray-700 shadow-sm backdrop-blur flex items-center justify-center hover:bg-white disabled:opacity-60"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}

            {imageAction && (
              <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
                Preparing image...
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
                <div key={src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
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
                  {displayImagePaths[i] && (
                    <div className="flex justify-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenImage(displayImagePaths[i], `open-${i}`)}
                        disabled={!!imageAction}
                        aria-label={`Open dye image ${i + 1}`}
                        className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 disabled:opacity-60"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(displayImagePaths[i], `dye-${dye.dyeNumber}-image-${i + 1}`, `download-${i}`)}
                        disabled={!!imageAction}
                        aria-label={`Download dye image ${i + 1}`}
                        className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 disabled:opacity-60"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
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
            {dye.coverImagePath && (
              <button
                type="button"
                onClick={() => handleDownloadImage(dye.coverImagePath, `dye-${dye.dyeNumber}-cover`, "download-cover")}
                disabled={!!imageAction}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {imageAction === "download-cover" ? "Preparing image..." : "Download Cover Image"}
              </button>
            )}
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
          </div>

          {/* Linked Designs */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Designs using this dye
            </h2>
            <EmptyState
              icon={Layers}
              title="Linked designs will appear here after designs are connected."
              description="Dyes are now connected to Supabase. Designs will be connected in a later migration phase."
            />
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
                onClick={handleSaveEdit}
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
