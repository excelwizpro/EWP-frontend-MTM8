"use client";

import { useCallback, useState } from "react";
import { WorkbookUploader } from "@/components/WorkbookUploader";
import { Template, TemplateManager } from "@/components/TemplateManager";
import { OutputViewer } from "@/components/OutputViewer";
import { UploadedWorkbook, runEngineApi } from "@/lib/api";

export default function HomePage() {
  const [workbook, setWorkbook] = useState<UploadedWorkbook | undefined>(undefined);
  const [schemas, setSchemas] = useState<any>(undefined);
  const [query, setQuery] = useState("");
  const [refine, setRefine] = useState("");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(undefined);
  const [context, setContext] = useState<any>(undefined);

  const handleUploaded = (wb: UploadedWorkbook | undefined, s: any) => {
    setWorkbook(wb);
    setSchemas(s);
    setError(null);
    setResult(undefined);
    setContext(undefined);
  };

  const effectiveQuery = refine.trim()
    ? `${query.trim()}

Refine / adjust as follows:
${refine.trim()}`
    : query;

  const handleRun = useCallback(async () => {
    if (!effectiveQuery.trim()) return;
    setRunning(true);
    setError(null);
    setResult(undefined);
    setContext(undefined);
    try {
      const res = await runEngineApi(effectiveQuery, workbook);
      if (!res.ok) {
        setError(res.error || "Engine error");
      } else {
        setResult(res.result);
        setContext(res.context);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Engine error");
    } finally {
      setRunning(false);
    }
  }, [effectiveQuery, workbook]);

  const handleApplyTemplate = (t: Template) => {
    setQuery(t.query);
    setRefine("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand-dark font-bold">
              EW
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                ExcelWizPro <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">MTM-8</span>
              </p>
              <p className="text-xs text-slate-500">
                Multi-intent semantic engine for Excel workbooks.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Backend: <span className="font-medium text-slate-700">Render • /upload • /run</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 py-4">
        {/* Left column */}
        <section className="flex w-[38%] flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">1 · Workbook</h2>
            <p className="mb-3 text-xs text-slate-500">
              Upload an Excel workbook. MTM-8 will detect regions, measures and dimensions automatically.
            </p>
            <WorkbookUploader onUploaded={handleUploaded} />

            {workbook && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-800">Detected sheets</p>
                <div className="flex flex-wrap gap-1.5">
                  {workbook.sheets.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <TemplateManager workbook={workbook} onApplyTemplate={handleApplyTemplate} />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">Engine status</h2>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• MTM-8 pipeline: tokenize → bind → semantic graph → IR.</li>
              <li>• Output includes semantic context, report plan and formula plan.</li>
              <li>• Use &quot;Refine&quot; to nudge the engine without losing intent.</li>
            </ul>
          </div>
        </section>

        {/* Right column */}
        <section className="flex w-[62%] flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-slate-900">2 · Ask a question</h2>
            <p className="mb-3 text-xs text-slate-500">
              Describe the table, pivot, chart or KPI you want. MTM-8 uses the uploaded workbook as context.
            </p>

            <div className="space-y-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Show total revenue by region for the last 6 months, as a table and a KPI card."
                className="w-full min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand-soft"
              />

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">Refine</p>
                  <p className="text-[11px] text-slate-500">
                    Optional: tweak without rewriting the whole prompt.
                  </p>
                </div>
                <textarea
                  value={refine}
                  onChange={(e) => setRefine(e.target.value)}
                  placeholder='e.g. "Focus only on Europe and sort descending by revenue."'
                  className="w-full min-h-[60px] rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand-soft"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={running || !effectiveQuery.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {running ? (
                    <>
                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Running MTM-8...
                    </>
                  ) : (
                    <>
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                      Run MTM-8
                    </>
                  )}
                </button>
                <div className="flex flex-1 items-center justify-end gap-3 text-[11px] text-slate-500">
                  <span>
                    Workbook:{" "}
                    <strong className="font-semibold">
                      {workbook ? `${workbook.sheets.length} sheet(s)` : "not uploaded yet"}
                    </strong>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Query length: <strong>{effectiveQuery.length}</strong> chars
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-[260px] flex-1">
            <OutputViewer result={result} context={context} />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
          <p className="text-[11px] text-slate-500">
            ExcelWizPro MTM-8 · semantic reporting engine for Excel. This UI is a thin shell over the backend.
          </p>
          <p className="text-[11px] text-slate-400">
            v1.0 · Frontend only · Backend: Render
          </p>
        </div>
      </footer>
    </div>
  );
}
