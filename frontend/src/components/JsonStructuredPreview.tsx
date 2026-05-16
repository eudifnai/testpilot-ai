interface JsonStructuredPreviewProps {
  raw: string;
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-2">
        {value.slice(0, 6).map((item, index) => (
          <li key={index} className="rounded-md bg-white px-3 py-2 text-sm text-slate-600">
            {typeof item === "object" ? JSON.stringify(item) : String(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object" && value !== null) {
    return <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{JSON.stringify(value, null, 2)}</pre>;
  }

  return <p className="text-sm leading-6 text-slate-600">{String(value)}</p>;
}

export function JsonStructuredPreview({ raw }: JsonStructuredPreviewProps) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return (
      <div className="grid gap-3">
        {Object.entries(parsed).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</p>
            <div className="mt-3">{renderValue(value)}</div>
          </div>
        ))}
      </div>
    );
  } catch {
    return <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{raw}</pre>;
  }
}
