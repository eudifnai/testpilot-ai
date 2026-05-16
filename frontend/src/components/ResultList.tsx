interface ResultListProps {
  title: string;
  items: string[];
}

export function ResultList({ title, items }: ResultListProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <ul className="space-y-2 text-sm leading-6 text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-white px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
