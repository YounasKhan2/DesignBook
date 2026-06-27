import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Edit, Trash2, Phone, User, FileText, ChevronLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import DesignCard from "../../shared/DesignCard";
import ConfirmDialog from "../../shared/ConfirmDialog";
import EmptyState from "../../shared/EmptyState";
import { Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCompanyById, getDesignsByCompany, deleteCompany, updateCompany } = useStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const company = getCompanyById(id ?? "");
  const designs = getDesignsByCompany(id ?? "");

  const [editForm, setEditForm] = useState({
    companyName: company?.companyName ?? "",
    companyNumber: company?.companyNumber ?? "",
    contactPerson: company?.contactPerson ?? "",
    phone: company?.phone ?? "",
    notes: company?.notes ?? "",
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-gray-500 mb-4">Company not found.</p>
        <button
          onClick={() => navigate("/app/companies")}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: "#1a3461" }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Companies
        </button>
      </div>
    );
  }

  const initials = company.companyName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const handleDelete = () => {
    deleteCompany(company.id);
    toast.success("Company deleted.");
    navigate("/app/companies");
  };

  const handleSaveEdit = () => {
    if (!editForm.companyName.trim() || !editForm.companyNumber.trim()) {
      toast.error("Company name and number are required.");
      return;
    }
    updateCompany(company.id, editForm);
    setShowEdit(false);
    toast.success("Company updated.");
  };

  const setEdit = (key: keyof typeof editForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ backgroundColor: "#1a3461" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{company.companyName}</h1>
            <p className="text-sm text-[#10b981] font-medium mt-0.5">{company.companyNumber}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                setEditForm({
                  companyName: company.companyName,
                  companyNumber: company.companyNumber,
                  contactPerson: company.contactPerson ?? "",
                  phone: company.phone ?? "",
                  notes: company.notes ?? "",
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

        {/* Details */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {company.contactPerson && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Contact Person</p>
                <p className="font-medium text-gray-800">{company.contactPerson}</p>
              </div>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 shrink-0">
                <Phone className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p className="font-medium text-gray-800">{company.phone}</p>
              </div>
            </div>
          )}
          {company.notes && (
            <div className="flex items-start gap-3 text-sm sm:col-span-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Notes</p>
                <p className="text-gray-700 leading-relaxed">{company.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Designs */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Designs ({designs.length})
        </h2>
        {designs.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No designs for this company"
            description="Add a design and link it to this company."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {designs.map((d) => (
              <DesignCard key={d.id} design={d} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEdit} onOpenChange={(v) => !v && setShowEdit(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {[
              { label: "Company Name *", key: "companyName", placeholder: "" },
              { label: "Company Number *", key: "companyNumber", placeholder: "" },
              { label: "Contact Person", key: "contactPerson", placeholder: "" },
              { label: "Phone", key: "phone", placeholder: "" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={editForm[key as keyof typeof editForm]}
                  onChange={setEdit(key as keyof typeof editForm)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
              <textarea
                value={editForm.notes}
                onChange={setEdit("notes")}
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
        title="Delete this company?"
        description={`"${company.companyName}" will be permanently removed. Linked designs will not be deleted.`}
        confirmLabel="Delete Company"
      />
    </div>
  );
}
