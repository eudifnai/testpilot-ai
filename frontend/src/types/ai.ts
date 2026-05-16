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
