import React, { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface ThumbnailUploadProps {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
}

// Reads the file into a data URL and keeps it in whatever state the caller
// manages (no localStorage). TODO: upload to real file storage and store
// just the resulting URL once a backend exists - a data URL works fine for
// this in-memory mock but isn't how this should work in production.
export default function ThumbnailUpload({ value, onChange, label = 'Thumbnail' }: ThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <label className="mb-1 block text-[13px] font-semibold text-stv-navy">{label}</label>
      {value ? (
        <div className="relative h-32 w-full overflow-hidden rounded-xl border border-stv-border">
          <img src={value} alt="Pratinjau thumbnail" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="Hapus thumbnail"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stv-navy shadow-sm hover:bg-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-stv-border text-stv-muted transition hover:border-blue-300 hover:text-blue-600"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-[12px] font-semibold">Klik untuk upload gambar</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}
