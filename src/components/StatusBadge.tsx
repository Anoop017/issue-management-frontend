import type { IssueStatus } from '@/lib/types';

const statusConfig: Record<IssueStatus, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  open: {
    label: 'Open',
    dotClass: 'bg-status-open',
    bgClass: 'bg-status-open-bg',
    textClass: 'text-status-open',
  },
  'in-progress': {
    label: 'In Progress',
    dotClass: 'bg-status-in-progress',
    bgClass: 'bg-status-in-progress-bg',
    textClass: 'text-status-in-progress',
  },
  closed: {
    label: 'Closed',
    dotClass: 'bg-status-closed',
    bgClass: 'bg-status-closed-bg',
    textClass: 'text-status-closed',
  },
};

export default function StatusBadge({ status }: { status: IssueStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
