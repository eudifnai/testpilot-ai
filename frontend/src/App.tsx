import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { APITestGeneratorPage } from "./pages/APITestGeneratorPage";
import { BugAnalyzerPage } from "./pages/BugAnalyzerPage";
import { RequirementAnalysisPage } from "./pages/RequirementAnalysisPage";
import { TestReportPage } from "./pages/TestReportPage";
import { TestcaseGeneratorPage } from "./pages/TestcaseGeneratorPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requirement-analysis" element={<RequirementAnalysisPage />} />
        <Route path="/testcase-generator" element={<TestcaseGeneratorPage />} />
        <Route path="/api-test-generator" element={<APITestGeneratorPage />} />
        <Route path="/bug-analyzer" element={<BugAnalyzerPage />} />
        <Route path="/test-report" element={<TestReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
