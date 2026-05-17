import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { TestcaseVersionSummary } from "../types/ai";
import { GhostButton } from "./GhostButton";
import { SectionCard } from "./SectionCard";

interface TestcaseVersionPanelProps {
  versions: TestcaseVersionSummary[];
  selectedVersionId?: number;
  onLoad: (versionId: number) => void;
  onRename: (versionId: number, versionName: string, notes: string) => void;
  onDelete: (versionId: number) => void;
}

function formatTimestamp(value: string) {
  if (!value) {
    return "Unknown time";
  }
  return new Date(value).toLocaleString();
}

export function TestcaseVersionPanel({
  versions,
  selectedVersionId,
  onLoad,
  onRename,
  onDelete,
}: TestcaseVersionPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftNotes, setDraftNotes] = useState("");

  function startEditing(version: TestcaseVersionSummary) {
    setEditingId(version.id);
    setDraftName(version.version_name);
    setDraftNotes(version.notes);
  }

  function stopEditing() {
    setEditingId(null);
    setDraftName("");
    setDraftNotes("");
  }

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
                  {editingId === version.id ? (
                    <div className="space-y-2">
                      <input
                        value={draftName}
                        onChange={(event) => setDraftName(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      />
                      <textarea
                        value={draftNotes}
                        onChange={(event) => setDraftNotes(event.target.value)}
                        className="min-h-[72px] w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900">{version.version_name}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">{formatTimestamp(version.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <GhostButton compact onClick={() => onLoad(version.id)}>
                    Load
                  </GhostButton>
                  {editingId === version.id ? (
                    <>
                      <GhostButton
                        compact
                        onClick={() => {
                          onRename(version.id, draftName, draftNotes);
                          stopEditing();
                        }}
                      >
                        Save
                      </GhostButton>
                      <GhostButton compact onClick={stopEditing}>
                        Cancel
                      </GhostButton>
                    </>
                  ) : (
                    <GhostButton compact onClick={() => startEditing(version)} icon={<Pencil className="h-4 w-4" />}>
                      Edit
                    </GhostButton>
                  )}
                  <GhostButton compact onClick={() => onDelete(version.id)} icon={<Trash2 className="h-4 w-4" />}>
                    Delete
                  </GhostButton>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{version.testcase_count} cases</p>
              {editingId !== version.id && version.notes ? (
                <p className="mt-2 text-sm leading-6 text-slate-500">{version.notes}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
