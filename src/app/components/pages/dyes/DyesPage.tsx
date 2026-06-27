import { useState, useMemo } from "react";
import { Plus, Droplets } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "../../../hooks/useStore";
import DyeCard from "../../shared/DyeCard";
import EmptyState from "../../shared/EmptyState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

function DyeForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { dyeName: string; dyeNumber: string; description: string };
  onSave: (data: { dyeName: string; dyeNumber: string; description: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(
    initial ?? { dyeName: "", dyeNumber: "", description: "" }
  );
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name *</label>
        <input
          type="text"
          value={form.dyeName}
          onChange={set("dyeName")}
          placeholder="e.g. Jet Black"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
        <input
          type="text"
          value={form.dyeNumber}
          onChange={set("dyeNumber")}
          placeholder="e.g. DYE-BK-001"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={2}
          placeholder="Describe this dye…"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none"
        />
      </div>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!form.dyeName.trim() || !form.dyeNumber.trim()) {
              toast.error("Dye name and number are required.");
              return;
            }
            onSave(form);
          }}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: "#1a3461" }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function DyesPage() {
  const { dyes, addDye, getDesignsByDye } = useStore();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const filtered = useMemo(
    () =>
      dyes.filter(
        (d) =>
          !search ||
          d.dyeName.toLowerCase().includes(search.toLowerCase()) ||
          d.dyeNumber.toLowerCase().includes(search.toLowerCase()) ||
          (d.description ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [dyes, search]
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dyes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dyes.length} dye references</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: "#1a3461" }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Dye</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dyes…"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title={search ? "No dyes found" : "No dyes yet"}
          description={search ? "Try a different search term." : "Add your first dye reference to get started."}
          action={
            !search ? (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#1a3461" }}
              >
                <Plus className="w-4 h-4" />
                Add Dye
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dye) => (
            <DyeCard
              key={dye.id}
              dye={dye}
              designCount={getDesignsByDye(dye.id).length}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={(v) => !v && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Dye</DialogTitle>
          </DialogHeader>
          <DyeForm
            onSave={(data) => {
              addDye(data);
              setShowAdd(false);
              toast.success("Dye added.");
            }}
            onCancel={() => setShowAdd(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
