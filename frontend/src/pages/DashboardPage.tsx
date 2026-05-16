import { ArrowRight, Bug, ClipboardList, FileCode2, FileSpreadsheet, FileText, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HistoryDetailPanel } from "../components/HistoryDetailPanel";
import { HistoryList } from "../components/HistoryList";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { SectionCard } from "../components/SectionCard";
import { getHistoryDetail, getRecentHistory } from "../services/api";
import type { HistoryDetail, HistoryRecord } from "../types/ai";

const quickActions = [
  {
    title: "Requirement analysis",
    description: "Break large product text into features, flows, risks, and QA questions.",
    to: "/requirement-analysis",
    icon: FileText,
  },
  {
    title: "Testcase generation",
    description: "Generate structured testcases and export them as a ready-to-share Excel file.",
    to: "/testcase-generator",
    icon: ClipboardList,
  },
  {
    title: "Excel-ready output",
    description: "Keep testcase output structured for handoff, review, and future automation.",
    to: "/testcase-generator",
    icon: FileSpreadsheet,
  },
  {
    title: "API test design",
    description: "Generate request coverage and automation hints from an API document or curl snippet.",
    to: "/api-test-generator",
    icon: FileCode2,
  },
  {
    title: "Bug analysis",
    description: "Turn issue notes, logs, and expected behavior into a structured bug report and checklist.",
    to: "/bug-analyzer",
    icon: Bug,
  },
  {
    title: "Test report",
    description: "Draft a markdown test report with scope, risks, defect summary, and release recommendation.",
    to: "/test-report",
    icon: ScrollText,
  },
];

export function DashboardPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<HistoryDetail | null>(null);

  useEffect(() => {
    getRecentHistory().then((response) => setHistory(response.records)).catch(() => setHistory([]));
  }, []);

  function handleSelectHistory(record: HistoryRecord) {
    getHistoryDetail(record.id).then(setSelectedHistoryDetail).catch(() => setSelectedHistoryDetail(null));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Testing assistant dashboard"
        description="Start from raw requirement text, turn it into test points, and move directly into structured testcase generation."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="P0 coverage" value="3" helper="Dashboard, requirement analysis, and testcase generation are ready to use." />
        <MetricCard label="Backend endpoints" value="7" helper="Core AI workflows and history retrieval are wired through FastAPI." />
        <MetricCard label="Fallback mode" value="Ready" helper="The backend can return deterministic local output when no AI credentials are configured." />
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.to}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-100 hover:shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-6 text-slate-500">{item.description}</p>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-700">
                <span>Open</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SectionCard
          title="Recent generation history"
          description="Review the latest generated outputs from the shared backend history store."
        >
          <HistoryList records={history} onSelect={handleSelectHistory} />
        </SectionCard>
        <HistoryDetailPanel detail={selectedHistoryDetail} />
      </div>
    </div>
  );
}
