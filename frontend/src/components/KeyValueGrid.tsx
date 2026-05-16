interface KeyValueGridProps {
  items: Array<{ label: string; value: string }>;
}

export function KeyValueGrid({ items }: KeyValueGridProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
          <dd className="mt-2 text-sm leading-6 text-slate-700">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
