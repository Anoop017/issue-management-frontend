'use client';

import type { IssueStatus, IssuePriority } from '@/lib/types';

interface IssueFiltersProps {
  search: string;
  status: IssueStatus | '';
  priority: IssuePriority | '';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: IssueStatus | '') => void;
  onPriorityChange: (value: IssuePriority | '') => void;
}

export default function IssueFilters({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
}: IssueFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="issue-search"
          type="text"
          placeholder="Search issues by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Status filter */}
      <select
        id="status-filter"
        value={status}
        onChange={(e) => onStatusChange(e.target.value as IssueStatus | '')}
        className="px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
      >
        <option value="">All Status</option>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>

      {/* Priority filter */}
      <select
        id="priority-filter"
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as IssuePriority | '')}
        className="px-3 py-2 border border-border rounded-lg text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
      >
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}
