"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ImageUploadProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  multiple?: boolean;
}

export function ImageUpload({
  label = "Images",
  images,
  onChange,
  folder = "products",
  multiple = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds the 5MB limit`);
          continue;
        }
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error?.message ?? "Upload failed");
        uploaded.push(json.data.url as string);
      }
      if (uploaded.length === 0) return;
      onChange(multiple ? [...images, ...uploaded] : uploaded);
      toast.success(uploaded.length > 1 ? "Images uploaded" : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <Label>{label}</Label>
      {images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="relative h-20 w-20 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-0 top-0 bg-red-500 px-1.5 text-xs text-white"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      {uploading && <p className="mt-1 text-xs text-muted">Uploading...</p>}
    </div>
  );
}
