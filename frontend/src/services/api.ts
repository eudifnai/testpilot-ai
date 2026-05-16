import axios from "axios";
import type { RequirementAnalysisResult, Testcase, TestcaseGenerationResult } from "../types/ai";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 30000,
});

export async function analyzeRequirement(requirementText: string) {
  const response = await apiClient.post<RequirementAnalysisResult>("/ai/analyze-requirement", {
    requirement_text: requirementText,
  });
  return response.data;
}

export async function generateTestcases(
  requirementText: string,
  caseTypes: string[],
  caseCount: number
) {
  const response = await apiClient.post<TestcaseGenerationResult>("/ai/generate-testcases", {
    requirement_text: requirementText,
    case_types: caseTypes,
    case_count: caseCount,
  });
  return response.data;
}

export async function exportTestcases(testcases: Testcase[]) {
  const response = await apiClient.post("/export/testcases", { testcases }, { responseType: "blob" });
  return response.data as Blob;
}
