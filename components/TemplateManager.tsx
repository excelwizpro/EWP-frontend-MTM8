"use client";

import { useEffect, useState } from "react";
import type { UploadedWorkbook } from "@/lib/api";

export interface Template {
  id: string;
  name: string;
  query: string;
  autoRun: boolean;
  createdAt: string;
  workbookSignature?: string;
}

const STORAGE_KEY = "excelwizpro_templates";

function makeSignature(workbook?: UploadedWorkbook): string | undefined {
  if (!workbook) return undefined;
  const sheetNames = workbook.sheets.map((s) => s.name).join("|");
  return `${workbook.sheets.length}:${sheetNames}`;
}

export function loadTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Template[];
  } catch {
    return [];
  }
}

export function saveTemplates(list: Template[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

interface Props {
  workbook?: UploadedWorkbook;
  onApplyTemplate: (template: Template) => void;
}

export function TemplateManager({ workbook, onApplyTemplate }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  // Auto-run matching templates when workbook changes
  useEffect(() => {
    if (!workbook) return;
    const sig = makeSignature(workbook);
    if (!sig) return;

    const list = loadTemplates();
    const autoTemplates = list.filter((t) => t.autoRun && t.workbookSignature === sig);

    if (autoTemplates.length === 1) {
      onApplyTemplate(autoTemplates[0]);
    }
  }, [workbook, onApplyTemplate]);

  const handleSave = () => {
    if (!query.trim()) return;

    const id = crypto.randomUUID();
    const t: Template = {
      id,
      name: name.trim() || "Saved template",
      query: query.trim(),
      autoRun,
      createdAt: new Date().toISOString(),
      workbookSignature: makeSignature(workbook)
    };

    const next = [t, ...templates];
    setTemplates(next);
    saveTemplates(next);
    setName("");
    setQuery("");
  };

  const removeTemplate = (id: string) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    saveTemplates(next);
  };

  const toggleAutoRun = (id: string) => {
    const next = templates.map((t) =>
      t.id === id ? { ...t, autoRun: !t.autoRun } : t
    );
    setTemplates(next);
    saveTemplates(next);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-semibold text-slate-900 mb-2">Save template</p>
        <div className="space-y-2">
          <input
            placeholder="Template name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand-soft"
          />
          <textarea
            placeholder="Query to save as template"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand-soft min-h-[70px]"
          />
          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={(e) => setAutoRun(e.target.checked)}
            />
            Auto-run this template when a matching workbook is uploaded
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Save template
          </button>
        </div>
      </div>

      {templates.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-sm font-semibold text-slate-900">Templates</p>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-900">
                    {t.name}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-slate-500 mt-0.5">
                    {t.query}
                  </p>
                  <button
                    type="button"
                    onClick={() => onApplyTemplate(t)}
                    className="mt-1 text-[11px] font-semibold text-brand hover:text-brand-dark"
                  >
                    Apply
                  </button>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => toggleAutoRun(t.id)}
                    className={`text-[11px] px-1.5 py-0.5 rounded-full border ${
                      t.autoRun
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-500"
                    }`}
                  >
                    {t.autoRun ? "Auto-run" : "Manual"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTemplate(t.id)}
                    className="text-[11px] text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
