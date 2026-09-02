"use client";

import { useRef, useState } from "react";
import { CreditCard, Upload, Check, X, FileText } from "lucide-react";
import { MAX_FILE_BYTES, type UploadedFile } from "@/interface/kyc";
import { ErrorNote, OutlineButton } from "./shared-ui";

export function UploadStep({ label, file, onFileSelected }: {
  label: string;
  file: UploadedFile | null;
  onFileSelected: (f: UploadedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  function processFile(selected: File | undefined) {
    if (!selected) return;
    if (selected.size > MAX_FILE_BYTES) { setError("File is too large. Max size is 10MB."); return; }
    const isImage = selected.type.startsWith("image/");
    setError("");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => onFileSelected({ name: selected.name, preview: reader.result as string, isImage: true, rawFile: selected });
      reader.readAsDataURL(selected);
    } else {
      onFileSelected({ name: selected.name, preview: null, isImage: false, rawFile: selected });
    }
  }

  return (
    <>
      <div
        onClick={() => !file && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files?.[0]); }}
        className={`relative flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-6 text-center transition-colors ${file ? "border-emerald-300 bg-emerald-50/40" : dragOver ? "border-[#1D4ED8] bg-[#f0f5ff]" : "border-[#dce7f5] bg-[#f8fafd] cursor-pointer hover:border-[#1D4ED8]/40"}`}
      >
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={e => processFile(e.target.files?.[0])} />
        {file ? (
          <>
            {file.isImage && file.preview
              ? <img src={file.preview} alt={file.name} className="h-16 w-24 rounded-lg object-cover" />
              : <FileText className="h-9 w-9 text-emerald-500" />
            }
            <p className="max-w-[160px] truncate text-xs font-semibold text-[#071F55]">{file.name}</p>
            <button onClick={e => { e.stopPropagation(); onFileSelected(null); }} className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline">
              <X className="h-3 w-3" /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="relative">
              <CreditCard className="h-9 w-9 text-[#9aacc9]" />
              <span className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
                <Upload className="h-2.5 w-2.5" />
              </span>
            </div>
            <p className="text-xs font-bold text-[#071F55]">Click to upload <span className="font-normal text-[#405981]">or drag and drop</span></p>
            <p className="text-[10.5px] text-[#8da3c4]">JPG, PNG or PDF (Max. 10MB)</p>
          </>
        )}
      </div>
      {error && <ErrorNote message={error} />}
      <div className="mt-5 w-full">
        {file ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
            <Check className="h-4 w-4" /> Uploaded
          </div>
        ) : (
          <OutlineButton onClick={() => inputRef.current?.click()}>Upload {label}</OutlineButton>
        )}
      </div>
    </>
  );
}
