import { ArrowRight, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import type { HistoryDetail } from "../types/ai";
import { copyText } from "../utils/clipboard";
import { saveHistoryDraft } from "../utils/historyDraft";
import { GhostButton } from "./GhostButton";
import { JsonStructuredPreview } from "./JsonStructuredPreview";
import { SectionCard } from "./SectionCard";

interface HistoryDetailPanelProps {
  detail: HistoryDetail | null;
}

const routeMap: Record<string, { to: string; label: string } | undefined> = {
  requirement_analysis: { to: "/requirement-analysis", label: "Reuse in Requirement Analysis" },
  testcase_generation: { to: "/testcase-generator", label: "Reuse in Testcase Generator" },
  api_test_generation: { to: "/api-test-generator", label: "Reuse in API Test Generator" },
  bug_analysis: { to: "/bug-analyzer", label: "Reuse in Bug Analyzer" },
  test_report: { to: "/test-report", label: "Reuse in Test Report" },
};

function formatTimestamp(value: string) {
  if (!value) {
    return "Unknown time";
  }
  return new Date(value).toLocaleString();
}

export function HistoryDetailPanel({ detail }: HistoryDetailPanelProps) {
  if (!detail) {
    return (
      <SectionCard title="History detail" description="Open a recent record to inspect the full input and output.">
        <p className="text-sm leading-6 text-slate-500">Choose a history record from the list to inspect or reuse it.</p>
      </SectionCard>
    );
  }

  const routeTarget = routeMap[detail.type];

  return (
    <SectionCard title="History detail" description={`Record #${detail.id} created ${formatTimestamp(detail.created_at)}`}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <GhostButton onClick={() => copyText(detail.input_text)} icon={<Copy className="h-4 w-4" />}>
            Copy input
          </GhostButton>
          <GhostButton onClick={() => copyText(detail.output_json)} icon={<Copy className="h-4 w-4" />}>
            Copy output
          </GhostButton>
          {routeTarget ? (
            <Link
              to={routeTarget.to}
              onClick={() => saveHistoryDraft({ type: detail.type, inputText: detail.input_text })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
            >
              <span>{routeTarget.label}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input</p>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{detail.input_text}</pre>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output Preview</p>
            <div className="mt-3">
              <JsonStructuredPreview raw={detail.output_json} />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
