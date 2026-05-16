import { Copy, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GhostButton } from "../components/GhostButton";
import { PageHeader } from "../components/PageHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ResultList } from "../components/ResultList";
import { SectionCard } from "../components/SectionCard";
import { analyzeRequirement } from "../services/api";
import type { RequirementAnalysisResult } from "../types/ai";
import { copyText } from "../utils/clipboard";
import { formatAnalysisForCopy } from "../utils/format";
import { consumeHistoryDraft } from "../utils/historyDraft";

const sampleRequirement = `Users can log in with a mobile number and password. Mobile number must contain 11 digits. Password length must be between 6 and 20 characters. If the password is entered incorrectly five times in a row, the account is locked for 30 minutes.`;

export function RequirementAnalysisPage() {
  const [requirementText, setRequirementText] = useState(sampleRequirement);
  const [result, setResult] = useState<RequirementAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const copyPayload = useMemo(() => {
    if (!result) {
      return "";
    }
    return formatAnalysisForCopy({
      Summary: result.summary,
      Features: result.features,
      "Business Flow": result.business_flow,
      "Test Points": result.test_points,
      Risks: result.risks,
      Questions: result.questions,
    });
  }, [result]);

  useEffect(() => {
    const draft = consumeHistoryDraft();
    if (draft?.type === "requirement_analysis" || draft?.type === "testcase_generation") {
      setRequirementText(draft.inputText);
    }
  }, []);

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    try {
      const response = await analyzeRequirement(requirementText);
      setResult(response);
    } catch {
      setError("Requirement analysis failed. Please confirm the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!copyPayload) {
      return;
    }
    await copyText(copyPayload);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P0 / Requirement Analysis"
        title="Turn raw product text into QA-ready structure"
        description="Paste requirement content and generate a compact QA brief with features, business flow, test focus, risks, and open questions."
        actions={
          <GhostButton onClick={handleCopy} disabled={!result} icon={<Copy className="h-4 w-4" />}>
            Copy result
          </GhostButton>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard
          title="Requirement input"
          description="Use plain text from a PRD, story, acceptance criteria, or testing note."
        >
          <div className="space-y-4">
            <textarea
              value={requirementText}
              onChange={(event) => setRequirementText(event.target.value)}
              className="min-h-[320px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              placeholder="Paste requirement content here..."
            />
            <div className="flex flex-wrap gap-3">
              <GhostButton onClick={() => setRequirementText(sampleRequirement)}>Load sample</GhostButton>
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isLoading || requirementText.trim().length < 10}
                icon={<Sparkles className="h-4 w-4" />}
              >
                {isLoading ? "Generating..." : "Generate analysis"}
              </PrimaryButton>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </SectionCard>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard title="Summary">{result ? <p className="text-sm leading-6 text-slate-600">{result.summary}</p> : <EmptyState />}</SectionCard>
          <ResultList title="Features" items={result?.features ?? []} />
          <ResultList title="Business flow" items={result?.business_flow ?? []} />
          <ResultList title="Test points" items={result?.test_points ?? []} />
          <ResultList title="Risks" items={result?.risks ?? []} />
          <ResultList title="Questions" items={result?.questions ?? []} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return <p className="text-sm leading-6 text-slate-500">Generate an analysis to review the structured result here.</p>;
}
