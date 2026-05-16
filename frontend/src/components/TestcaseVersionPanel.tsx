import type { TestcaseVersionSummary } from "../types/ai";
import { GhostButton } from "./GhostButton";
import { SectionCard } from "./SectionCard";

interface TestcaseVersionPanelProps {
  versions: TestcaseVersionSummary[];
  selectedVersionId?: number;
  onLoad: (versionId: number) => void;
}

function formatTimestamp(value: string) {
  if (!value) {
    return "Unknown time";
  }
  return new Date(value).toLocaleString();
}

export function TestcaseVersionPanel({ versions, selectedVersionId, onLoad }: TestcaseVersionPanelProps) {
  return (
    <SectionCard title="Saved versions" description="Load a previously saved testcase snapshot back into the editor.">
      {versions.length === 0 ? (
        <p className="text-sm leading-6 text-slate-500">No saved testcase versions yet.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={[
                "rounded-lg border p-4",
                selectedVersionId === version.id ? "border-brand-200 bg-brand-50/50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{version.version_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatTimestamp(version.created_at)}</p>
                </div>
                <GhostButton onClick={() => onLoad(version.id)}>Load</GhostButton>
              </div>
              <p className="mt-3 text-sm text-slate-600">{version.testcase_count} cases</p>
              {version.notes ? <p className="mt-2 text-sm leading-6 text-slate-500">{version.notes}</p> : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
