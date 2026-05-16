import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { RequirementAnalysisPage } from "./pages/RequirementAnalysisPage";
import { TestcaseGeneratorPage } from "./pages/TestcaseGeneratorPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/requirement-analysis" element={<RequirementAnalysisPage />} />
        <Route path="/testcase-generator" element={<TestcaseGeneratorPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
