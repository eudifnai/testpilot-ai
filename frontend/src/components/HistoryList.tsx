import type { HistoryRecord } from "../types/ai";

interface HistoryListProps {
  records: HistoryRecord[];
}

function formatTimestamp(value: string) {
  if (!value) {
    return "Unknown time";
  }
  return new Date(value).toLocaleString();
}

export function HistoryList({ records }: HistoryListProps) {
  if (records.length === 0) {
    return <p className="text-sm leading-6 text-slate-500">No recent generation records yet.</p>;
  }

  return (
    <div className="space-y-3">
      {records.map((record) => (
        <div key={record.id} className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{record.type.replace(/_/g, " ")}</p>
              <p className="text-xs text-slate-500">{formatTimestamp(record.created_at)}</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              #{record.id}
            </span>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{record.input_preview}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{record.output_preview}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
