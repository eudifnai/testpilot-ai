import { Copy, Download, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { GhostButton } from "../components/GhostButton";
import { PageHeader } from "../components/PageHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { generateReport } from "../services/api";
import { copyText } from "../utils/clipboard";
import { downloadTextFile } from "../utils/download";
import { consumeHistoryDraft } from "../utils/historyDraft";

const initialState = {
  project_name: "TestPilot AI",
  version: "0.2.0",
  test_scope: "Requirement analysis, testcase generation, API testcase generation, bug analysis, and report generation pages.",
  test_result: "Core workflows pass smoke validation. Excel export works. History records are created for generation actions.",
  bug_summary: "2 medium-priority issues pending wider UX and edge-case regression.",
  risk_notes: "AI fallback mode is deterministic and useful for demos, but real model output still needs broader prompt calibration.",
  test_environment: "Local Windows dev environment with FastAPI and Vite dev servers.",
};

export function TestReportPage() {
  const [form, setForm] = useState(initialState);
  const [reportMarkdown, setReportMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = consumeHistoryDraft();
    if (draft?.type === "test_report") {
      try {
        const parsed = JSON.parse(draft.inputText) as typeof initialState;
        setForm((current) => ({ ...current, ...parsed }));
      } catch {
        // ignore malformed draft payload
      }
    }
  }, []);

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    try {
      const response = await generateReport(form);
      setReportMarkdown(response.report_markdown);
    } catch {
      setError("Test report generation failed. Please confirm the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 / Test Report"
        title="Draft a test report in markdown"
        description="Capture project context, scope, results, defect summary, and risks. The generated report stays easy to review and copy into release notes or handoff docs."
        actions={
          <>
            <GhostButton onClick={() => reportMarkdown && copyText(reportMarkdown)} disabled={!reportMarkdown} icon={<Copy className="h-4 w-4" />}>
              Copy markdown
            </GhostButton>
            <GhostButton
              onClick={() =>
                reportMarkdown &&
                downloadTextFile(reportMarkdown, `${(form.project_name || "test-report").replace(/\s+/g, "-").toLowerCase()}.md`, "text/markdown;charset=utf-8")
              }
              disabled={!reportMarkdown}
              icon={<Download className="h-4 w-4" />}
            >
              Export .md
            </GhostButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard title="Report input" description="Feed the report builder with concise test execution facts and risk framing.">
          <div className="space-y-4">
            <Field label="Project Name" value={form.project_name} onChange={(value) => setForm((current) => ({ ...current, project_name: value }))} />
            <Field label="Version" value={form.version} onChange={(value) => setForm((current) => ({ ...current, version: value }))} />
            <Area label="Test Scope" value={form.test_scope} onChange={(value) => setForm((current) => ({ ...current, test_scope: value }))} />
            <Area label="Test Result" value={form.test_result} onChange={(value) => setForm((current) => ({ ...current, test_result: value }))} />
            <Area label="Bug Summary" value={form.bug_summary} onChange={(value) => setForm((current) => ({ ...current, bug_summary: value }))} />
            <Area label="Risk Notes" value={form.risk_notes} onChange={(value) => setForm((current) => ({ ...current, risk_notes: value }))} />
            <Field label="Test Environment" value={form.test_environment} onChange={(value) => setForm((current) => ({ ...current, test_environment: value }))} />
            <PrimaryButton onClick={handleGenerate} disabled={isLoading} icon={<Sparkles className="h-4 w-4" />}>
              {isLoading ? "Generating..." : "Generate report"}
            </PrimaryButton>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </SectionCard>

        <SectionCard title="Markdown preview" description="Rendered preview of the generated report.">
          {reportMarkdown ? (
            <div className="prose prose-slate max-w-none prose-headings:mb-3 prose-headings:mt-6 prose-p:leading-7">
              <ReactMarkdown>{reportMarkdown}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">Generate a report to preview the markdown output here.</p>
          )}
        </SectionCard>
      </div>
    </div>
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
        className="min-h-[110px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
