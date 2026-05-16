import type { APITestcase } from "../types/ai";

interface APITestTableProps {
  testcases: APITestcase[];
}

export function APITestTable({ testcases }: APITestTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              {["Case ID", "Title", "Type", "Request Data", "Expected Status", "Expected Result"].map((header) => (
                <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {testcases.map((item) => (
              <tr key={item.case_id} className="align-top">
                <td className="px-4 py-4 text-sm font-medium text-slate-900">{item.case_id}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.title}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.case_type}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <pre className="whitespace-pre-wrap break-words font-sans">{JSON.stringify(item.request_data, null, 2)}</pre>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.expected_status}</td>
                <td className="px-4 py-4 text-sm text-slate-600">{item.expected_result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
