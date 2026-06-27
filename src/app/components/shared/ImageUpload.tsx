import React, { useRef } from "react";
import { Upload, X, Star, Camera } from "lucide-react";
import { cn } from "../ui/utils";

interface Props {
  images: string[];
  coverImage: string;
  onImagesChange: (images: string[]) => void;
  onCoverChange: (url: string) => void;
}

export default function ImageUpload({ images, coverImage, onImagesChange, onCoverChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onImagesChange([...images, url]);
        if (images.length === 0) onCoverChange(url);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (url: string) => {
    const next = images.filter((i) => i !== url);
    onImagesChange(next);
    if (coverImage === url) {
      onCoverChange(next[0] ?? "");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-[#1a3461]/40 hover:bg-[#1a3461]/3 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Upload className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700">Drop images here or click to browse</p>
        <p className="text-xs text-gray-400">JPG, PNG, WEBP — multiple allowed</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Camera button */}
      <button
        type="button"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.capture = "environment";
          input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
          input.click();
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </button>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((url) => (
            <div
              key={url}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                coverImage === url ? "border-[#10b981]" : "border-transparent"
              )}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />

              {/* Cover indicator */}
              {coverImage === url && (
                <div className="absolute top-1 left-1 bg-[#10b981] rounded-full p-0.5">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center gap-1 opacity-0 hover:opacity-100">
                {coverImage !== url && (
                  <button
                    type="button"
                    onClick={() => onCoverChange(url)}
                    className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                    title="Set as cover"
                  >
                    <Star className="w-3 h-3 text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center"
                  title="Remove"
                >
                  <X className="w-3 h-3 text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          Tap a photo to set it as the cover image
        </p>
      )}
    </div>
  );
}
