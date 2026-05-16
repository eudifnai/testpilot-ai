import { Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { GhostButton } from "../components/GhostButton";
import { KeyValueGrid } from "../components/KeyValueGrid";
import { PageHeader } from "../components/PageHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ResultList } from "../components/ResultList";
import { SectionCard } from "../components/SectionCard";
import { analyzeBug } from "../services/api";
import type { BugAnalysisResult } from "../types/ai";
import { copyText } from "../utils/clipboard";
import { formatObjectForCopy } from "../utils/format";

const initialForm = {
  title: "Login fails after valid credentials",
  steps: "1. Open login page\n2. Enter valid mobile and password\n3. Submit login form",
  actual_result: "API returns 500 and the user remains on the login page.",
  expected_result: "User logs in successfully and lands on the dashboard.",
  logs: "NullPointerException in auth service",
  environment: "staging / Chrome latest",
  api_response: "{\"code\":500,\"message\":\"internal error\"}",
  console_error: "Failed to fetch /api/login 500",
};

export function BugAnalyzerPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<BugAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const copyPayload = useMemo(() => {
    if (!result) {
      return "";
    }
    return formatObjectForCopy({
      "Standard Bug Report": result.standard_bug_report,
      "Possible Causes": result.possible_causes,
      Severity: result.severity,
      Priority: result.priority,
      "Impact Scope": result.impact_scope,
      "Developer Checklist": result.developer_checklist,
      "Suggested Additional Info": result.suggested_additional_info,
    });
  }, [result]);

  async function handleAnalyze() {
    setIsLoading(true);
    setError("");
    try {
      const response = await analyzeBug(form);
      setResult(response);
    } catch {
      setError("Bug analysis failed. Please confirm the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 / Bug Analyzer"
        title="Turn bug notes into a cleaner debugging handoff"
        description="Paste the issue title, repro steps, observed behavior, expected behavior, logs, and environment notes to get a structured bug report and developer checklist."
        actions={
          <GhostButton onClick={() => copyPayload && copyText(copyPayload)} disabled={!result} icon={<Copy className="h-4 w-4" />}>
            Copy analysis
          </GhostButton>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard title="Bug input" description="Capture enough context for a useful first-pass analysis.">
          <div className="space-y-4">
            <Field label="Title" value={form.title} onChange={(value) => setForm((current) => ({ ...current, title: value }))} />
            <Area label="Reproduction Steps" value={form.steps} onChange={(value) => setForm((current) => ({ ...current, steps: value }))} />
            <Area label="Actual Result" value={form.actual_result} onChange={(value) => setForm((current) => ({ ...current, actual_result: value }))} />
            <Area label="Expected Result" value={form.expected_result} onChange={(value) => setForm((current) => ({ ...current, expected_result: value }))} />
            <Area label="Logs" value={form.logs} onChange={(value) => setForm((current) => ({ ...current, logs: value }))} />
            <Field label="Environment" value={form.environment} onChange={(value) => setForm((current) => ({ ...current, environment: value }))} />
            <Area label="API Response" value={form.api_response} onChange={(value) => setForm((current) => ({ ...current, api_response: value }))} />
            <Area label="Console Error" value={form.console_error} onChange={(value) => setForm((current) => ({ ...current, console_error: value }))} />
            <PrimaryButton onClick={handleAnalyze} disabled={isLoading} icon={<Sparkles className="h-4 w-4" />}>
              {isLoading ? "Analyzing..." : "Analyze bug"}
            </PrimaryButton>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Severity and impact" description="A quick triage view for prioritization.">
            {result ? (
              <KeyValueGrid
                items={[
                  { label: "Severity", value: result.severity },
                  { label: "Priority", value: result.priority },
                  { label: "Impact Scope", value: result.impact_scope },
                ]}
              />
            ) : (
              <p className="text-sm leading-6 text-slate-500">Analyze a bug to get triage guidance here.</p>
            )}
          </SectionCard>

          <SectionCard title="Standard bug report">
            {result ? <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{result.standard_bug_report}</pre> : <p className="text-sm leading-6 text-slate-500">Structured bug content will appear here.</p>}
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            <ResultList title="Possible causes" items={result?.possible_causes ?? []} />
            <ResultList title="Developer checklist" items={result?.developer_checklist ?? []} />
            <ResultList title="Suggested additional info" items={result?.suggested_additional_info ?? []} />
          </div>
        </div>
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
        className="min-h-[96px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
