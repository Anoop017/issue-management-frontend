'use client';

import { useState, useEffect } from 'react';
import type {
  Issue,
  IssuePriority,
  IssueStatus,
  CreateIssueData,
  UpdateIssueData,
} from '@/lib/types';

interface IssueFormProps {
  issue?: Issue | null;
  onSubmit: (data: CreateIssueData | UpdateIssueData) => Promise<void>;
  onClose: () => void;
}

export default function IssueForm({ issue, onSubmit, onClose }: IssueFormProps) {
  const isEdit = !!issue;
  const [title, setTitle] = useState(issue?.title ?? '');
  const [description, setDescription] = useState(issue?.description ?? '');
  const [priority, setPriority] = useState<IssuePriority>(issue?.priority ?? 'medium');
  const [status, setStatus] = useState<IssueStatus>(issue?.status ?? 'open');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (issue) {
      setTitle(issue.title);
      setDescription(issue.description);
      setPriority(issue.priority);
      setStatus(issue.status);
    }
  }, [issue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await onSubmit({ title, description, priority, status } as UpdateIssueData);
      } else {
        await onSubmit({ title, description, priority } as CreateIssueData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {isEdit ? 'Edit Issue' : 'Create New Issue'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-priority-high-bg text-danger text-sm rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="issue-title" className="block text-sm font-medium text-foreground mb-1">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter issue title"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="issue-description" className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              id="issue-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="issue-priority" className="block text-sm font-medium text-foreground mb-1">
                Priority
              </label>
              <select
                id="issue-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {isEdit && (
              <div className="flex-1">
                <label htmlFor="issue-status" className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  id="issue-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Issue' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
