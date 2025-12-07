"use client";

import { useRef, useState } from "react";
import { uploadWorkbookApi, UploadedWorkbook } from "@/lib/api";

interface Props {
  onUploaded: (workbook: UploadedWorkbook | undefined, schemas: any) => void;
}

export function WorkbookUploader({ onUploaded }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workbookName, setWorkbookName] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setError(null);
    setUploading(true);
    setWorkbookName(file.name);

    try {
      const res = await uploadWorkbookApi(file);
      if (!res.ok) {
        setError(res.error || "Upload failed");
        onUploaded(undefined, undefined);
      } else {
        onUploaded(res.workbook, res.schemas);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Upload failed");
      onUploaded(undefined, undefined);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition bg-white ${
          dragOver ? "border-brand bg-brand-soft/50" : "border-slate-200 hover:border-brand-soft"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">Upload Workbook (.xlsx)</p>
            <p className="text-sm text-slate-500">
              Drop a file here or click to browse. ExcelWizPro will infer schema and regions automatically.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-dark disabled:opacity-60"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Choose file"}
          </button>
        </div>
      </div>

      {workbookName && (
        <p className="text-xs text-slate-500">
          Current workbook: <span className="font-medium text-slate-800">{workbookName}</span>
        </p>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
