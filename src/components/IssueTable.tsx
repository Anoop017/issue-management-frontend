'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import type { Issue } from '@/lib/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface IssueTableProps {
  issues: Issue[];
  onEdit: (issue: Issue) => void;
  onDelete: (issue: Issue) => void;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
  onToggleSelectAll?: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function ActionMenu({
  issue,
  onEdit,
  onDelete,
}: {
  issue: Issue;
  onEdit: (issue: Issue) => void;
  onDelete: (issue: Issue) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-md hover:bg-sidebar-hover text-muted transition-colors cursor-pointer"
        aria-label="Issue actions"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-border rounded-lg shadow-lg z-10 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(issue);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-sidebar-hover transition-colors cursor-pointer"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(issue);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-sidebar-hover transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function IssueTable({
  issues,
  onEdit,
  onDelete,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: IssueTableProps) {
  const router = useRouter();

  if (issues.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-border"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-base font-medium">No issues found</p>
        <p className="text-sm mt-1">Try adjusting your filters or create a new issue.</p>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="pb-3 w-10 px-2">
            {onToggleSelectAll && (
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer w-4 h-4"
                checked={issues.length > 0 && selectedIds?.length === issues.length}
                onChange={onToggleSelectAll}
              />
            )}
          </th>
          <th className="pb-3 text-xs font-medium text-muted uppercase tracking-wider w-24">
            ID
          </th>
          <th className="pb-3 text-xs font-medium text-muted uppercase tracking-wider">
            Title
          </th>
          <th className="pb-3 text-xs font-medium text-muted uppercase tracking-wider w-32">
            Status
          </th>
          <th className="pb-3 text-xs font-medium text-muted uppercase tracking-wider w-28">
            Priority
          </th>
          <th className="pb-3 text-xs font-medium text-muted uppercase tracking-wider w-28">
            Updated
          </th>
          <th className="pb-3 w-10" />
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => (
          <tr
            key={issue.id}
            onClick={() => router.push(`/issues/${issue.id}`)}
            className="border-b border-border-light hover:bg-sidebar-hover cursor-pointer transition-colors group"
          >
            <td className="py-4 px-2" onClick={(e) => e.stopPropagation()}>
              {onToggleSelect && (
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer w-4 h-4"
                  checked={selectedIds?.includes(issue.id) || false}
                  onChange={() => onToggleSelect(issue.id)}
                />
              )}
            </td>
            <td className="py-4 text-sm text-muted font-mono">
              {issue.id}
            </td>
            <td className="py-4 pr-4">
              <p className="text-sm font-medium text-foreground transition-colors">
                {issue.title}
              </p>
              {issue.description && (
                <p className="text-xs text-muted mt-0.5 truncate max-w-md">
                  {issue.description}
                </p>
              )}
            </td>
            <td className="py-4">
              <StatusBadge status={issue.status} />
            </td>
            <td className="py-4">
              <PriorityBadge priority={issue.priority} />
            </td>
            <td className="py-4 text-sm text-muted">{timeAgo(issue.updatedAt)}</td>
            <td className="py-4">
              <ActionMenu issue={issue} onEdit={onEdit} onDelete={onDelete} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
