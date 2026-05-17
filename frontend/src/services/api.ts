import axios from "axios";
import type {
  APITestGenerationResult,
  BugAnalysisResult,
  HistoryDetail,
  HistoryListResult,
  RequirementAnalysisResult,
  Testcase,
  TestcaseGenerationResult,
  TestcaseVersionDetail,
  TestcaseVersionListResult,
  TestReportResult,
} from "../types/ai";

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

export async function generateApiTests(apiDoc: string) {
  const response = await apiClient.post<APITestGenerationResult>("/ai/generate-api-tests", {
    api_doc: apiDoc,
  });
  return response.data;
}

export async function analyzeBug(payload: {
  title: string;
  steps: string;
  actual_result: string;
  expected_result: string;
  logs: string;
  environment: string;
  api_response: string;
  console_error: string;
}) {
  const response = await apiClient.post<BugAnalysisResult>("/ai/analyze-bug", payload);
  return response.data;
}

export async function generateReport(payload: {
  project_name: string;
  version: string;
  test_scope: string;
  test_result: string;
  bug_summary: string;
  risk_notes: string;
  test_environment: string;
}) {
  const response = await apiClient.post<TestReportResult>("/ai/generate-report", payload);
  return response.data;
}

export async function getRecentHistory(limit = 8) {
  const response = await apiClient.get<HistoryListResult>(`/ai/history/recent?limit=${limit}`);
  return response.data;
}

export async function getHistoryDetail(recordId: number) {
  const response = await apiClient.get<HistoryDetail>(`/ai/history/${recordId}`);
  return response.data;
}

export async function saveTestcaseVersion(payload: {
  version_name: string;
  requirement_text: string;
  case_types: string[];
  case_count: number;
  notes: string;
  testcases: Testcase[];
}) {
  const response = await apiClient.post<TestcaseVersionDetail>("/testcase-versions", payload);
  return response.data;
}

export async function getTestcaseVersions(limit = 20) {
  const response = await apiClient.get<TestcaseVersionListResult>(`/testcase-versions?limit=${limit}`);
  return response.data;
}

export async function getTestcaseVersion(versionId: number) {
  const response = await apiClient.get<TestcaseVersionDetail>(`/testcase-versions/${versionId}`);
  return response.data;
}

export async function updateTestcaseVersion(versionId: number, payload: { version_name: string; notes: string }) {
  const response = await apiClient.put<TestcaseVersionDetail>(`/testcase-versions/${versionId}`, payload);
  return response.data;
}

export async function deleteTestcaseVersion(versionId: number) {
  const response = await apiClient.delete<{ message: string }>(`/testcase-versions/${versionId}`);
  return response.data;
}
