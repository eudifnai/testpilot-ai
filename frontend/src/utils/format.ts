export function formatAnalysisForCopy(sections: Record<string, string[] | string>) {
  return Object.entries(sections)
    .map(([title, value]) => {
      if (Array.isArray(value)) {
        return `${title}\n${value.map((item) => `- ${item}`).join("\n")}`;
      }
      return `${title}\n${value}`;
    })
    .join("\n\n");
}

export function formatTestcasesForCopy(
  testcases: {
    case_id: string;
    title: string;
    case_type: string;
    steps: string[];
    expected_result: string;
  }[]
) {
  return testcases
    .map(
      (item) =>
        `${item.case_id} | ${item.case_type}\n${item.title}\n${item.steps
          .map((step, index) => `${index + 1}. ${step}`)
          .join("\n")}\nExpected: ${item.expected_result}`
    )
    .join("\n\n");
}
