import { Copy, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { APITestTable } from "../components/APITestTable";
import { GhostButton } from "../components/GhostButton";
import { KeyValueGrid } from "../components/KeyValueGrid";
import { PageHeader } from "../components/PageHeader";
import { PrimaryButton } from "../components/PrimaryButton";
import { ResultList } from "../components/ResultList";
import { SectionCard } from "../components/SectionCard";
import { generateApiTests } from "../services/api";
import type { APITestGenerationResult } from "../types/ai";
import { copyText } from "../utils/clipboard";

const sampleApiDoc = `POST /api/login
Request body:
- mobile: string, required, 11 digits
- password: string, required, 6-20 chars
Response 200: token, user_id, user_name, role
Response 401: invalid credentials`;

export function APITestGeneratorPage() {
  const [apiDoc, setApiDoc] = useState(sampleApiDoc);
  const [result, setResult] = useState<APITestGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const copyPayload = useMemo(() => {
    if (!result) {
      return "";
    }
    return JSON.stringify(result, null, 2);
  }, [result]);

  async function handleGenerate() {
    setIsLoading(true);
    setError("");
    try {
      const response = await generateApiTests(apiDoc);
      setResult(response);
    } catch {
      setError("API testcase generation failed. Please confirm the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="P1 / API Test Generator"
        title="Generate API testcase coverage from docs or curl snippets"
        description="Paste API documentation, Swagger fragments, or curl content to produce request coverage, validation scenarios, and automation hints."
        actions={
          <GhostButton onClick={() => copyPayload && copyText(copyPayload)} disabled={!result} icon={<Copy className="h-4 w-4" />}>
            Copy result
          </GhostButton>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard title="API document input" description="Structured notes, field descriptions, and curl examples all work here.">
          <div className="space-y-4">
            <textarea
              value={apiDoc}
              onChange={(event) => setApiDoc(event.target.value)}
              className="min-h-[320px] w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
            <div className="flex gap-3">
              <GhostButton onClick={() => setApiDoc(sampleApiDoc)}>Load sample</GhostButton>
              <PrimaryButton onClick={handleGenerate} disabled={isLoading || apiDoc.trim().length < 10} icon={<Sparkles className="h-4 w-4" />}>
                {isLoading ? "Generating..." : "Generate API tests"}
              </PrimaryButton>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="API summary" description="Review the detected method, path, and endpoint naming before using the testcase set.">
            {result ? (
              <KeyValueGrid
                items={[
                  { label: "API Name", value: result.api_name },
                  { label: "Method", value: result.method },
                  { label: "Path", value: result.path },
                ]}
              />
            ) : (
              <p className="text-sm leading-6 text-slate-500">Generate API tests to inspect the parsed endpoint details here.</p>
            )}
          </SectionCard>

          <SectionCard title="API testcase table" description="Normal, validation, boundary, and authorization coverage in one place.">
            {result ? <APITestTable testcases={result.testcases} /> : <p className="text-sm leading-6 text-slate-500">No API testcases generated yet.</p>}
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2">
            <ResultList title="Missing info" items={result?.missing_info ?? []} />
            <SectionCard title="Automation suggestion">
              {result ? <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{result.script_suggestion}</pre> : <p className="text-sm leading-6 text-slate-500">Automation suggestion will appear here.</p>}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
