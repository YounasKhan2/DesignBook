import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Download, Edit, ExternalLink, Trash2, Building2, Droplets, ChevronLeft, Images } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "../../shared/ConfirmDialog";
import type { Company, Dye } from "../../../types";
import { getCompanyById } from "../../../services/companiesService";
import { getDyeById } from "../../../services/dyesService";
import { downloadPrivateImage, openPrivateImage } from "../../../services/imageDownloadService";
import {
  deleteDesign,
  getDesignById,
  getDesignErrorMessage,
  type DesignWithRelations,
} from "../../../services/designsService";

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [design, setDesign] = useState<DesignWithRelations | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [dye, setDye] = useState<Dye | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imageAction, setImageAction] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const nextDesign = await getDesignById(id);
        setDesign(nextDesign);
        setActiveImg(0);
        if (nextDesign) {
          const [nextCompany, nextDye] = await Promise.all([
            getCompanyById(nextDesign.companyId),
            getDyeById(nextDesign.dyeId),
          ]);
          setCompany(nextCompany);
          setDye(nextDye);
        }
      } catch (error) {
        toast.error(getDesignErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-5 md:p-8">
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

  const displayImages = design.images.length > 0
    ? design.images
    : design.coverImage
      ? [design.coverImage]
      : [];
  const displayImagePaths = design.imagePaths && design.imagePaths.length > 0
    ? design.imagePaths
    : design.coverImagePath
      ? [design.coverImagePath]
      : [];
  const activeImagePath = displayImagePaths[activeImg] ?? displayImagePaths[0];

  const handleDelete = async () => {
    try {
      await deleteDesign(design.id);
      toast.success("Design deleted.");
      navigate("/app/designs");
    } catch (error) {
      toast.error(getDesignErrorMessage(error));
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="md:grid md:grid-cols-[1fr_380px] md:gap-0 min-h-screen">
        {/* Left: image gallery */}
        <div className="md:sticky md:top-0 md:h-screen flex flex-col">
          <div className="relative flex-1 bg-gray-100 overflow-hidden md:rounded-none min-h-[55vw] md:min-h-0">
            {displayImages.length > 0 ? (
              <img
                src={displayImages[activeImg] ?? displayImages[0]}
                alt={design.designName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Images className="w-16 h-16 text-gray-300" />
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
                  onClick={() => handleDownloadImage(activeImagePath, `design-${design.designNumber}-image-${activeImg + 1}`, "download-active")}
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
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </button>
                  {displayImagePaths[i] && (
                    <div className="flex justify-center gap-1 mt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenImage(displayImagePaths[i], `open-${i}`)}
                        disabled={!!imageAction}
                        aria-label={`Open design image ${i + 1}`}
                        className="w-6 h-6 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 disabled:opacity-60"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(displayImagePaths[i], `design-${design.designNumber}-image-${i + 1}`, `download-${i}`)}
                        disabled={!!imageAction}
                        aria-label={`Download design image ${i + 1}`}
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
              {design.designNumber}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-4">
              {design.designName}
            </h1>

            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/app/designs/${design.id}/edit`)}
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
            {design.coverImagePath && (
              <button
                type="button"
                onClick={() => handleDownloadImage(design.coverImagePath, `design-${design.designNumber}-cover`, "download-cover")}
                disabled={!!imageAction}
                className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                {imageAction === "download-cover" ? "Preparing image..." : "Download Cover Image"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {company && (
              <button
                onClick={() => navigate(`/app/companies/${company.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0"
                  style={{ backgroundColor: "#1a3461" }}>
                  {company.companyName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Company</p>
                  <p className="text-sm font-semibold text-gray-900">{company.companyName}</p>
                  <p className="text-xs text-[#10b981]">{company.companyNumber}</p>
                </div>
                <Building2 className="w-4 h-4 text-gray-300 ml-auto" />
              </button>
            )}

            {dye && (
              <button
                onClick={() => navigate(`/app/dyes/${dye.id}`)}
                className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#10b98115" }}>
                  <Droplets className="w-4 h-4" style={{ color: "#10b981" }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Dye</p>
                  <p className="text-sm font-semibold text-gray-900">{dye.dyeName}</p>
                  <p className="text-xs text-[#10b981]">{dye.dyeNumber}</p>
                </div>
                <Droplets className="w-4 h-4 text-gray-300 ml-auto" />
              </button>
            )}
          </div>

          {design.description && (
            <div className="border-t border-gray-100 pt-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{design.description}</p>
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Created</span>
              <span>{new Date(design.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Updated</span>
              <span>{new Date(design.updatedAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Images</span>
              <span>{displayImages.length} photo{displayImages.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete this design?"
        description={`"${design.designName}" will be permanently removed from your catalog.`}
        confirmLabel="Delete Design"
      />
    </div>
  );
}
