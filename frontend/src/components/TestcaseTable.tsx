import { Copy } from "lucide-react";
import type { Testcase } from "../types/ai";
import { copyText } from "../utils/clipboard";
import { GhostButton } from "./GhostButton";

interface TestcaseTableProps {
  testcases: Testcase[];
  selectedCaseId?: string;
  onSelect?: (caseId: string) => void;
}

function formatSingleTestcase(testcase: Testcase) {
  return [
    `${testcase.case_id} | ${testcase.case_type} | ${testcase.priority}`,
    `Module: ${testcase.module}`,
    `Title: ${testcase.title}`,
    `Precondition: ${testcase.precondition}`,
    `Steps:\n${testcase.steps.map((step, index) => `${index + 1}. ${step}`).join("\n")}`,
    `Test Data: ${testcase.test_data}`,
    `Expected Result: ${testcase.expected_result}`,
    `Remark: ${testcase.remark || "-"}`,
  ].join("\n\n");
}

export function TestcaseTable({ testcases, selectedCaseId, onSelect }: TestcaseTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              {["Case ID", "Module", "Title", "Priority", "Type", "Steps", "Expected Result", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {testcases.map((item) => (
              <tr
                key={item.case_id}
                className={[
                  "align-top transition",
                  onSelect ? "cursor-pointer hover:bg-slate-50" : "",
                  selectedCaseId === item.case_id ? "bg-brand-50/50" : "",
                ].join(" ")}
                onClick={() => onSelect?.(item.case_id)}
              >
                <td className="px-4 py-4 text-sm font-medium text-slate-900">{item.case_id}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.module}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.title}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.priority}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.case_type}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <ol className="list-decimal space-y-2 pl-5">
                    {item.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.expected_result}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <GhostButton
                    compact
                    icon={<Copy className="h-4 w-4" />}
                    onClick={(event) => {
                      event.stopPropagation();
                      copyText(formatSingleTestcase(item));
                    }}
                  >
                    Copy
                  </GhostButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
