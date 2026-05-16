export interface RequirementAnalysisResult {
  summary: string;
  features: string[];
  business_flow: string[];
  test_points: string[];
  risks: string[];
  questions: string[];
}

export interface Testcase {
  case_id: string;
  module: string;
  title: string;
  precondition: string;
  steps: string[];
  test_data: string;
  expected_result: string;
  priority: string;
  case_type: string;
  remark: string;
}

export interface TestcaseGenerationResult {
  testcases: Testcase[];
}

export interface APITestcase {
  case_id: string;
  title: string;
  request_data: Record<string, unknown> | unknown[] | string;
  expected_status: number;
  expected_result: string;
  case_type: string;
}

export interface APITestGenerationResult {
  api_name: string;
  method: string;
  path: string;
  testcases: APITestcase[];
  script_suggestion: string;
  missing_info: string[];
}

export interface BugAnalysisResult {
  standard_bug_report: string;
  possible_causes: string[];
  severity: string;
  priority: string;
  impact_scope: string;
  developer_checklist: string[];
  suggested_additional_info: string[];
}

export interface TestReportResult {
  report_markdown: string;
}

export interface HistoryRecord {
  id: number;
  type: string;
  input_preview: string;
  output_preview: string;
  created_at: string;
}

export interface HistoryListResult {
  records: HistoryRecord[];
}
