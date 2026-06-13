import type { IssuePriority } from '@/lib/types';

const priorityConfig: Record<IssuePriority, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  high: {
    label: 'High',
    dotClass: 'bg-priority-high',
    bgClass: 'bg-priority-high-bg',
    textClass: 'text-priority-high',
  },
  medium: {
    label: 'Medium',
    dotClass: 'bg-priority-medium',
    bgClass: 'bg-priority-medium-bg',
    textClass: 'text-priority-medium',
  },
  low: {
    label: 'Low',
    dotClass: 'bg-priority-low',
    bgClass: 'bg-priority-low-bg',
    textClass: 'text-priority-low',
  },
};

export default function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const config = priorityConfig[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgClass} ${config.textClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
