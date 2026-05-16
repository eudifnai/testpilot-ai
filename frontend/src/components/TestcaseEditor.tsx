import type { Testcase } from "../types/ai";
import { GhostButton } from "./GhostButton";
import { PrimaryButton } from "./PrimaryButton";
import { SectionCard } from "./SectionCard";

interface TestcaseEditorProps {
  testcase: Testcase | null;
  onChange: (next: Testcase) => void;
  onClose: () => void;
}

export function TestcaseEditor({ testcase, onChange, onClose }: TestcaseEditorProps) {
  if (!testcase) {
    return (
      <SectionCard title="Case editor" description="Select a testcase row to tune its content before export.">
        <p className="text-sm leading-6 text-slate-500">Pick a generated testcase to edit its title, steps, priority, data, or notes.</p>
      </SectionCard>
    );
  }

  const currentTestcase = testcase;

  function update<K extends keyof Testcase>(key: K, value: Testcase[K]) {
    onChange({ ...currentTestcase, [key]: value });
  }

  return (
    <SectionCard title={`Editing ${testcase.case_id}`} description="Changes here update the in-memory result set and will be used for copy and export.">
      <div className="space-y-4">
        <Field label="Module" value={currentTestcase.module} onChange={(value) => update("module", value)} />
        <Field label="Title" value={currentTestcase.title} onChange={(value) => update("title", value)} />
        <Field label="Priority" value={currentTestcase.priority} onChange={(value) => update("priority", value)} />
        <Field label="Case Type" value={currentTestcase.case_type} onChange={(value) => update("case_type", value)} />
        <Area label="Precondition" value={currentTestcase.precondition} onChange={(value) => update("precondition", value)} />
        <Area label="Test Data" value={currentTestcase.test_data} onChange={(value) => update("test_data", value)} />
        <Area label="Expected Result" value={currentTestcase.expected_result} onChange={(value) => update("expected_result", value)} />
        <Area
          label="Steps"
          value={currentTestcase.steps.join("\n")}
          onChange={(value) =>
            update(
              "steps",
              value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean)
            )
          }
        />
        <Area label="Remark" value={currentTestcase.remark} onChange={(value) => update("remark", value)} />
        <div className="flex gap-3">
          <PrimaryButton type="button" onClick={onClose}>
            Done editing
          </PrimaryButton>
          <GhostButton type="button" onClick={onClose}>
            Close
          </GhostButton>
        </div>
      </div>
    </SectionCard>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[90px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
