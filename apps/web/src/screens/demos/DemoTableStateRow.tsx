import { CalendarX2, LoaderCircle } from 'lucide-react';

interface DemoTableStateRowProps {
  colSpan: number;
  loading: boolean;
  title: string;
  description: string;
}

export function DemoTableStateRow({
  colSpan,
  loading,
  title,
  description,
}: DemoTableStateRowProps) {
  const Icon = loading ? LoaderCircle : CalendarX2;

  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <div className="flex h-64 flex-col items-center justify-center gap-2 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 text-slate-400">
            <Icon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          </div>
          <p className="text-sm font-bold text-slate-700" role="status">
            {loading ? 'Loading demos...' : title}
          </p>
          <p className="text-xs font-medium text-slate-500">
            {loading ? 'Fetching the latest demo records.' : description}
          </p>
        </div>
      </td>
    </tr>
  );
}
