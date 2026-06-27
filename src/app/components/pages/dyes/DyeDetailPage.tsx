import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Edit, Trash2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import DesignCard from "../../shared/DesignCard";
import ConfirmDialog from "../../shared/ConfirmDialog";
import EmptyState from "../../shared/EmptyState";
import { Layers } from "lucide-react";
import { getDyeColor } from "../../shared/DyeCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export default function DyeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDyeById, getDesignsByDye, getCompanyById, deleteDye, updateDye } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const dye = getDyeById(id ?? "");
  const designs = getDesignsByDye(id ?? "");

  const [editForm, setEditForm] = useState({
    dyeName: dye?.dyeName ?? "",
    dyeNumber: dye?.dyeNumber ?? "",
    description: dye?.description ?? "",
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

  const color = getDyeColor(dye.dyeNumber);

  const handleDelete = () => {
    deleteDye(dye.id);
    toast.success("Dye deleted.");
    navigate("/app/dyes");
  };

  const setEdit = (key: keyof typeof editForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        {/* Color band */}
        <div
          className="h-24 w-full"
          style={{ backgroundColor: color }}
        />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 -mt-10 mb-4">
            <div
              className="w-16 h-16 rounded-2xl border-4 border-white shadow-md shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex gap-2 pt-10">
              <button
                onClick={() => {
                  setEditForm({
                    dyeName: dye.dyeName,
                    dyeNumber: dye.dyeNumber,
                    description: dye.description ?? "",
                  });
                  setShowEdit(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h1 className="text-xl font-bold text-gray-900">{dye.dyeName}</h1>
          <p className="text-sm font-medium mt-0.5" style={{ color: "#10b981" }}>{dye.dyeNumber}</p>

          {dye.description && (
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">{dye.description}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
            <span>Added {new Date(dye.createdAt).toLocaleDateString("en-AE", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span style={{ color: "#1a3461", fontWeight: 500 }}>{designs.length} design{designs.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Linked Designs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Designs using this dye ({designs.length})
        </h2>
        {designs.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No designs use this dye yet"
            description="When you add designs with this dye, they'll appear here."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {designs.map((d) => {
              const company = getCompanyById(d.companyId);
              return (
                <DesignCard key={d.id} design={d} companyName={company?.companyName} />
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(v) => !v && setShowEdit(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Dye</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name *</label>
              <input
                type="text"
                value={editForm.dyeName}
                onChange={setEdit("dyeName")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
              <input
                type="text"
                value={editForm.dyeNumber}
                onChange={setEdit("dyeNumber")}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={editForm.description}
                onChange={setEdit("description")}
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none"
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
                  if (!editForm.dyeName.trim() || !editForm.dyeNumber.trim()) {
                    toast.error("Dye name and number are required.");
                    return;
                  }
                  updateDye(dye.id, editForm);
                  setShowEdit(false);
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
