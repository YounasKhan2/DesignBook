import { useEffect, useMemo, useState } from "react";
import { Plus, Droplets } from "lucide-react";
import { toast } from "sonner";
import DyeCard from "../../shared/DyeCard";
import EmptyState from "../../shared/EmptyState";
import ImageUpload from "../../shared/ImageUpload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import type { Dye } from "../../../types";
import {
  getDyeErrorMessage,
  type DyeInput,
} from "../../../services/dyesService";
import { useCreateDye, useDyes } from "../../../hooks/useCatalogQueries";

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

interface DyeFormData {
  dyeName: string;
  dyeNumber: string;
  description: string;
  images: string[];
  coverImage: string;
}

function DyeForm({
  existingDyes,
  excludeId,
  onSave,
  onCancel,
}: {
  existingDyes: Dye[];
  excludeId?: string;
  onSave: (data: DyeFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<DyeFormData>(
    { dyeName: "", dyeNumber: "", description: "", images: [], coverImage: "" }
  );
  const [errors, setErrors] = useState<Partial<Record<"dyeName" | "dyeNumber", string>>>({});

  const set = (key: "dyeName" | "dyeNumber" | "description") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const save = () => {
    const e: typeof errors = {};
    if (!form.dyeName.trim()) e.dyeName = "Dye name is required.";
    if (!form.dyeNumber.trim()) {
      e.dyeNumber = "Dye number is required.";
    } else {
      const norm = form.dyeNumber.trim().toLowerCase();
      const dup = existingDyes.find((d) => d.id !== excludeId && d.dyeNumber.toLowerCase() === norm);
      if (dup) e.dyeNumber = `Dye number "${form.dyeNumber.trim()}" is already used. Choose a different number.`;
    }
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave(form);
  };

  return (
    <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Name *</label>
        <input type="text" value={form.dyeName} onChange={set("dyeName")}
          placeholder="e.g. Jet Black" className={inputCls(!!errors.dyeName)} autoFocus />
        <FieldError msg={errors.dyeName} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dye Number *</label>
        <input type="text" value={form.dyeNumber} onChange={set("dyeNumber")}
          placeholder="e.g. DYE-BK-001" className={inputCls(!!errors.dyeNumber)} />
        <FieldError msg={errors.dyeNumber} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea value={form.description} onChange={set("description")} rows={2}
          placeholder="Describe this dye — colour tone, fabric type, usage…"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dye Images</label>
        <ImageUpload
          images={form.images}
          coverImage={form.coverImage}
          onImagesChange={(imgs) => setForm((prev) => ({ ...prev, images: imgs }))}
          onCoverChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
        />
      </div>
      <div className="flex gap-3 pt-1 sticky bottom-0 bg-white pb-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button type="button" onClick={save}
          className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all"
          style={{ backgroundColor: "#1a3461" }}>
          Save Dye
        </button>
      </div>
    </div>
  );
}

export default function DyesPage() {
  const { data: dyes = [], isLoading, isError, error } = useDyes();
  const createDyeMutation = useCreateDye();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (isError) toast.error(getDyeErrorMessage(error));
  }, [error, isError]);

  const filtered = useMemo(
    () => dyes.filter(
      (d) => !search ||
        d.dyeName.toLowerCase().includes(search.toLowerCase()) ||
        d.dyeNumber.toLowerCase().includes(search.toLowerCase()) ||
        (d.description ?? "").toLowerCase().includes(search.toLowerCase())
    ),
    [dyes, search]
  );

  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto">
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

      <div className="mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dyes…"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1a3461] focus:ring-2 focus:ring-[#1a3461]/10 transition-all" />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-14 text-center">
          <p className="text-sm text-gray-500">Loading dyes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Droplets}
          title={search ? "No dyes found" : "No dyes yet"}
          description={search ? "Try a different search term." : "Add your first dye reference to get started."}
          action={
            !search ? (
              <button onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#1a3461" }}>
                <Plus className="w-4 h-4" />
                Add Dye
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((dye) => (
            <DyeCard key={dye.id} dye={dye} designCount={0} />
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={(v) => !v && setShowAdd(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Dye</DialogTitle>
          </DialogHeader>
          <DyeForm
            existingDyes={dyes}
            onSave={async (data) => {
              try {
                const input: DyeInput = {
                  dyeName: data.dyeName,
                  dyeNumber: data.dyeNumber,
                  description: data.description,
                  coverImage: data.coverImage,
                };
                await createDyeMutation.mutateAsync({ input, images: data.images });
                setShowAdd(false);
                toast.success("Dye added.");
              } catch (error) {
                toast.error(getDyeErrorMessage(error));
              }
            }}
            onCancel={() => setShowAdd(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
