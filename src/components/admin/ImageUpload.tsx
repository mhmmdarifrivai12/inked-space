import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  aspect?: "square" | "video" | "wide";
  compact?: boolean;
}

export function ImageUpload({ label, value, onChange, aspect = "wide", compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const aspectClass =
    aspect === "square" ? "aspect-square" : aspect === "video" ? "aspect-video" : "aspect-[16/9]";

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran maksimal 5MB");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("site-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("site-images").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Gambar berhasil diupload");
    } catch (e: any) {
      toast.error(e.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {value && (
          <img src={value} alt="" className="h-12 w-12 rounded-lg object-cover shrink-0" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="glass rounded-xl px-3 py-2 text-xs flex items-center gap-2 hover:maroon-glow disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : value ? "Ganti" : "Upload"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="p-2 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
          {label}
        </label>
      )}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative ${aspectClass} w-full max-w-md rounded-2xl border border-dashed border-border bg-background/40 overflow-hidden cursor-pointer hover:border-accent transition-colors group`}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs">
              <Upload className="h-4 w-4" /> Ganti gambar
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span>{uploading ? "Uploading..." : "Klik untuk upload gambar"}</span>
            <span className="text-[10px] opacity-60">JPG / PNG · maks 5MB</span>
          </div>
        )}
      </div>
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="mt-2 text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
        >
          <X className="h-3 w-3" /> Hapus gambar
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
