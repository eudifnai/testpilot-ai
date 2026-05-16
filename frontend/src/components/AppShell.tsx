import { Bug, ClipboardList, FileCode2, FileSearch, LayoutDashboard, ScrollText } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requirement-analysis", label: "Requirement Analysis", icon: FileSearch },
  { to: "/testcase-generator", label: "Testcase Generator", icon: ClipboardList },
  { to: "/api-test-generator", label: "API Test Generator", icon: FileCode2 },
  { to: "/bug-analyzer", label: "Bug Analyzer", icon: Bug },
  { to: "/test-report", label: "Test Report", icon: ScrollText },
];

function linkClassName(isActive: boolean) {
  return [
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  ].join(" ");
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-6">
        <aside className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-5">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">TestPilot AI</p>
            <h1 className="text-xl font-semibold">AI testing workspace</h1>
            <p className="text-sm leading-6 text-slate-500">
              Build requirement analysis and structured testcases from a single working surface.
            </p>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClassName(isActive)}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Current scope: requirement analysis, testcase generation, API test design, bug analysis, test report drafting, and recent history recall.
          </div>
        </aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
