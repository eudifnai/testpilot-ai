import { Copy, Download, Save, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GhostButton } from "../components/GhostButton";
import { PageHeader } from "../components/PageHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { SectionCard } from "../components/SectionCard";
import { TestcaseEditor } from "../components/TestcaseEditor";
import { TestcaseTable } from "../components/TestcaseTable";
import { TestcaseVersionPanel } from "../components/TestcaseVersionPanel";
import {
  exportTestcases,
  generateTestcases,
  getTestcaseVersion,
  getTestcaseVersions,
  saveTestcaseVersion,
} from "../services/api";
import type { Testcase, TestcaseVersionSummary } from "../types/ai";
import { copyText } from "../utils/clipboard";
import { downloadBlob } from "../utils/download";
import { formatTestcasesForCopy } from "../utils/format";
import { consumeHistoryDraft } from "../utils/historyDraft";

const testcaseOptions = [
  { id: "functional", label: "Functional" },
  { id: "boundary", label: "Boundary" },
  { id: "exception", label: "Exception" },
  { id: "security", label: "Security" },
];

const sampleRequirement = `Users can log in with a mobile number and password. Mobile number must contain 11 digits. Password length must be between 6 and 20 characters. If the password is entered incorrectly five times in a row, the account is locked for 30 minutes.`;

export function TestcaseGeneratorPage() {
  const [requirementText, setRequirementText] = useState(sampleRequirement);
  const [caseTypes, setCaseTypes] = useState<string[]>(["functional", "boundary", "exception"]);
  const [caseCount, setCaseCount] = useState(12);
  const [testcases, setTestcases] = useState<Testcase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingVersion, setIsSavingVersion] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [versionName, setVersionName] = useState("");
  const [versionNotes, setVersionNotes] = useState("");
  const [savedVersions, setSavedVersions] = useState<TestcaseVersionSummary[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | undefined>(undefined);

  const testcaseCopyText = useMemo(() => formatTestcasesForCopy(testcases), [testcases]);
  const selectedTestcase = useMemo(
    () => testcases.find((item) => item.case_id === selectedCaseId) ?? null,
    [selectedCaseId, testcases]
  );

  useEffect(() => {
    const draft = consumeHistoryDraft();
    if (draft?.type === "testcase_generation" || draft?.type === "requirement_analysis") {
      setRequirementText(draft.inputText);
    }
    refreshVersions();
  }, []);

  async function refreshVersions() {
    try {
      const response = await getTestcaseVersions();
      setSavedVersions(response.versions);
    } catch {
      setSavedVersions([]);
    }
  }

  function toggleCaseType(caseType: string) {
    setCaseTypes((current) =>
      current.includes(caseType) ? current.filter((item) => item !== caseType) : [...current, caseType]
    );
  }

  async function handleGenerate() {
    if (caseTypes.length === 0) {
      setError("Select at least one testcase type.");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const response = await generateTestcases(requirementText, caseTypes, caseCount);
      setTestcases(response.testcases);
      setSelectedCaseId(response.testcases[0]?.case_id ?? "");
      setSaveMessage("");
    } catch {
      setError("Testcase generation failed. Please confirm the backend is running and try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const file = await exportTestcases(testcases);
      downloadBlob(file, "testcases.xlsx");
    } catch {
      setError("Excel export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleCopy() {
    if (testcases.length === 0) {
      return;
    }
    await copyText(testcaseCopyText);
  }

  async function handleSaveVersion() {
    if (testcases.length === 0) {
      return;
    }
    setIsSavingVersion(true);
    setError("");
    setSaveMessage("");
    try {
      const response = await saveTestcaseVersion({
        version_name: versionName.trim() || `Snapshot ${new Date().toLocaleString()}`,
        requirement_text: requirementText,
        case_types: caseTypes,
        case_count: caseCount,
        notes: versionNotes,
        testcases,
      });
      setSaveMessage(`Saved as ${response.version_name}`);
      setSelectedVersionId(response.id);
      await refreshVersions();
    } catch {
      setError("Saving testcase version failed. Please try again.");
    } finally {
      setIsSavingVersion(false);
    }
  }

  async function handleLoadVersion(versionId: number) {
    setError("");
    try {
      const version = await getTestcaseVersion(versionId);
      setSelectedVersionId(version.id);
      setRequirementText(version.requirement_text);
      setCaseTypes(version.case_types);
      setCaseCount(version.case_count || version.testcases.length);
      setVersionName(version.version_name);
      setVersionNotes(version.notes);
      setTestcases(version.testcases);
      setSelectedCaseId(version.testcases[0]?.case_id ?? "");
      setSaveMessage(`Loaded ${version.version_name}`);
    } catch {
      setError("Loading testcase version failed. Please try again.");
    }
  }

  function handleTestcaseChange(next: Testcase) {
    setTestcases((current) => current.map((item) => (item.case_id === next.case_id ? next : item)));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P0 / Testcase Generation"
        title="Generate structured testcases and export them"
        description="Turn requirement text into reviewable QA cases, inspect them in a table, then export to Excel for sharing or downstream editing."
        actions={
          <>
            <GhostButton onClick={handleCopy} disabled={testcases.length === 0} icon={<Copy className="h-4 w-4" />}>
              Copy cases
            </GhostButton>
            <GhostButton
              onClick={handleSaveVersion}
              disabled={testcases.length === 0 || isSavingVersion}
              icon={<Save className="h-4 w-4" />}
            >
              {isSavingVersion ? "Saving..." : "Save version"}
            </GhostButton>
            <PrimaryButton
              onClick={handleExport}
              disabled={testcases.length === 0 || isExporting}
              icon={<Download className="h-4 w-4" />}
            >
              {isExporting ? "Exporting..." : "Export Excel"}
            </PrimaryButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard title="Generator settings" description="Tune testcase type coverage and output count before generation.">
          <div className="space-y-5">
            <textarea
              value={requirementText}
              onChange={(event) => setRequirementText(event.target.value)}
              className="min-h-[260px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              placeholder="Paste requirement content here..."
            />
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Testcase types</p>
              <div className="flex flex-wrap gap-2">
                {testcaseOptions.map((item) => {
                  const selected = caseTypes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCaseType(item.id)}
                      className={[
                        "rounded-lg border px-3 py-2 text-sm font-medium transition",
                        selected
                          ? "border-brand-600 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Case count</span>
              <input
                type="number"
                min={1}
                max={100}
                value={caseCount}
                onChange={(event) => setCaseCount(Number(event.target.value))}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Version name</span>
              <input
                value={versionName}
                onChange={(event) => setVersionName(event.target.value)}
                placeholder="Login regression baseline"
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Version notes</span>
              <textarea
                value={versionNotes}
                onChange={(event) => setVersionNotes(event.target.value)}
                placeholder="Why this snapshot matters"
                className="min-h-[88px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <GhostButton onClick={() => setRequirementText(sampleRequirement)}>Load sample</GhostButton>
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerating || requirementText.trim().length < 10}
                icon={<Sparkles className="h-4 w-4" />}
              >
                {isGenerating ? "Generating..." : "Generate testcases"}
              </PrimaryButton>
            </div>
            {saveMessage ? <p className="text-sm text-emerald-700">{saveMessage}</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Generated testcase table"
          description="Review the cases in place before copying or exporting. Click a row to edit it."
        >
          {testcases.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span>{testcases.length} cases generated</span>
                <span>{caseTypes.length} selected case type groups</span>
              </div>
              <TestcaseTable
                testcases={testcases}
                selectedCaseId={selectedCaseId}
                onSelect={setSelectedCaseId}
              />
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-500">Generate testcases to preview them here in table form.</p>
          )}
        </SectionCard>
      </div>

      <TestcaseVersionPanel
        versions={savedVersions}
        selectedVersionId={selectedVersionId}
        onLoad={handleLoadVersion}
      />

      <TestcaseEditor
        testcase={selectedTestcase}
        onChange={handleTestcaseChange}
        onClose={() => setSelectedCaseId("")}
      />
    </div>
  );
}
