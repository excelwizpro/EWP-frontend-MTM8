"use client";

import { useState } from "react";

interface Props {
  result: any;
  context: any;
}

export function OutputViewer({ result, context }: Props) {
  const [tab, setTab] = useState<"summary" | "raw">("summary");

  const hasResult = result != null;
  const hasContext = context != null;

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div>
          <p className="text-sm font-semibold text-slate-900">Engine output</p>
          <p className="text-xs text-slate-500">
            MTM-8 pipeline results: semantic context • query graph • formula plan.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-slate-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab("summary")}
            className={`px-3 py-0.5 rounded-full ${
              tab === "summary" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Summary
          </button>
          <button
            type="button"
            onClick={() => setTab("raw")}
            className={`px-3 py-0.5 rounded-full ${
              tab === "raw" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3 text-xs text-slate-800">
        {!hasResult && !hasContext && (
          <p className="text-slate-500">
            Run a query to see MTM-8 output here. You&apos;ll get a high-level summary and the
            underlying IR in JSON form.
          </p>
        )}

        {tab === "summary" && (hasResult || hasContext) && (
          <div className="space-y-3">
            {hasResult && (
              <div>
                <p className="mb-1 font-semibold text-slate-900">Result</p>
                <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-slate-100">
{JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            {hasContext && (
              <div>
                <p className="mb-1 font-semibold text-slate-900">Context</p>
                <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-slate-100">
{JSON.stringify(context, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {tab === "raw" && (
          <pre className="max-h-[480px] overflow-auto rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-slate-100">
{JSON.stringify({ result, context }, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
