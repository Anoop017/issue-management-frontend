'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { IssueStatus, IssuePriority } from '@/lib/types';
import { getIssue, updateIssue, deleteIssue } from '@/lib/api';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import CommentThread from '@/components/CommentThread';
import DeleteConfirm from '@/components/DeleteConfirm';
import AiAnalysis from '@/components/AiAnalysis';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const issueId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  // ─── Fetch issue (may already be in cache from list page) ──
  const {
    data: issue,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: () => getIssue(issueId),
  });

  // ─── Delete modal ──────────────────────────────────────
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Inline editing state ──────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Sync edit fields when issue loads or changes
  const currentTitle = issue?.title ?? '';
  const currentDescription = issue?.description ?? '';

  function startEditTitle() {
    setEditTitle(currentTitle);
    setEditingField('title');
  }

  function startEditDescription() {
    setEditDescription(currentDescription);
    setEditingField('description');
  }

  // ─── Update helpers (write-through to cache) ───────────
  async function handleStatusChange(newStatus: IssueStatus) {
    if (!issue) return;
    try {
      const updated = await toast.promise(updateIssue(issue.id, { status: newStatus }), {
        loading: 'Updating status...',
        success: <b>Status updated!</b>,
        error: <b>Could not update status.</b>,
      });
      queryClient.setQueryData(['issue', issue.id], updated);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  async function handlePriorityChange(newPriority: IssuePriority) {
    if (!issue) return;
    try {
      const updated = await toast.promise(updateIssue(issue.id, { priority: newPriority }), {
        loading: 'Updating priority...',
        success: <b>Priority updated!</b>,
        error: <b>Could not update priority.</b>,
      });
      queryClient.setQueryData(['issue', issue.id], updated);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  }

  async function handleSaveTitle() {
    if (!issue || !editTitle.trim()) return;
    try {
      const updated = await toast.promise(updateIssue(issue.id, { title: editTitle.trim() }), {
        loading: 'Saving title...',
        success: <b>Title saved!</b>,
        error: <b>Could not save title.</b>,
      });
      queryClient.setQueryData(['issue', issue.id], updated);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setEditingField(null);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  }

  async function handleSaveDescription() {
    if (!issue) return;
    try {
      const updated = await toast.promise(updateIssue(issue.id, { description: editDescription }), {
        loading: 'Saving description...',
        success: <b>Description saved!</b>,
        error: <b>Could not save description.</b>,
      });
      queryClient.setQueryData(['issue', issue.id], updated);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      setEditingField(null);
    } catch (err) {
      console.error('Failed to update description:', err);
    }
  }

  async function handleDelete() {
    if (!issue) return;
    setDeleteLoading(true);
    try {
      await toast.promise(deleteIssue(issue.id), {
        loading: 'Deleting issue...',
        success: <b>Issue deleted!</b>,
        error: <b>Could not delete issue.</b>,
      });
      queryClient.removeQueries({ queryKey: ['issue', issue.id] });
      queryClient.removeQueries({ queryKey: ['comments', issue.id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      router.push('/issues');
    } catch (err) {
      console.error('Failed to delete:', err);
      setDeleteLoading(false);
    }
  }

  // ─── Loading / Error states ────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center text-muted">
          <div className="inline-block w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading issue...</p>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[50vh]">
        <div className="text-center">
          <p className="text-danger mb-2">
            {error instanceof Error ? error.message : 'Issue not found'}
          </p>
          <button
            onClick={() => router.push('/issues')}
            className="text-sm text-primary hover:underline"
          >
            ← Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column (main content) */}
        <div className="lg:col-span-2">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push('/issues')}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Issues
            </button>

            <button
              id="delete-issue-btn"
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Issue
            </button>
          </div>

          {/* Issue header card */}
          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            {/* Top row: ID + Edit Buttons */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted font-medium">
                {issue.id}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={startEditDescription}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Issue
                </button>
              </div>
            </div>

            {/* Title */}
            {editingField === 'title' ? (
              <div className="mb-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') setEditingField(null);
                  }}
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={handleSaveTitle} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium">
                    Save Title
                  </button>
                  <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-sm border border-border text-foreground rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer font-medium">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h1 className="text-2xl font-bold mb-4 text-foreground">
                {issue.title}
              </h1>
            )}

            {/* Badges Row (Status, Priority) */}
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted font-medium">Status:</span>
                <select
                  value={issue.status}
                  onChange={async (e) => {
                    const newStatus = e.target.value as IssueStatus;
                    try {
                      await toast.promise(updateIssue(issue.id, { status: newStatus }), {
                        loading: 'Updating status...',
                        success: <b>Status updated!</b>,
                        error: <b>Failed to update status.</b>,
                      });
                      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
                      queryClient.invalidateQueries({ queryKey: ['issues'] });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-white border border-border text-sm font-medium rounded-lg focus:ring-primary focus:border-primary block px-2.5 py-1.5 cursor-pointer text-foreground hover:bg-sidebar-hover transition-colors"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted font-medium">Priority:</span>
                <select
                  value={issue.priority}
                  onChange={async (e) => {
                    const newPriority = e.target.value as IssuePriority;
                    try {
                      await toast.promise(updateIssue(issue.id, { priority: newPriority }), {
                        loading: 'Updating priority...',
                        success: <b>Priority updated!</b>,
                        error: <b>Failed to update priority.</b>,
                      });
                      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
                      queryClient.invalidateQueries({ queryKey: ['issues'] });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-white border border-border text-sm font-medium rounded-lg focus:ring-primary focus:border-primary block px-2.5 py-1.5 cursor-pointer text-foreground hover:bg-sidebar-hover transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <hr className="border-border mb-6" />

            {/* Metadata row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  Created on
                </p>
                <p className="text-sm font-medium text-foreground">{formatDate(issue.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Updated on
                </p>
                <p className="text-sm font-medium text-foreground">{formatDate(issue.updatedAt)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
              {editingField === 'description' ? (
                <div>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={5}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleSaveDescription} className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer font-medium">
                      Save Description
                    </button>
                    <button onClick={() => setEditingField(null)} className="px-3 py-1.5 text-sm border border-border text-foreground rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer font-medium">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-sm text-muted whitespace-pre-wrap cursor-pointer hover:bg-sidebar-hover rounded-lg p-2 -mx-2 transition-colors"
                  onClick={startEditDescription}
                  title="Click to edit"
                >
                  {issue.description || (
                    <span className="italic">No description provided. Click to add one.</span>
                  )}
                </p>
              )}
            </div>

          </div>

          {/* Comments section */}
          <div className="bg-white border border-border rounded-xl p-6 mb-6">
            <CommentThread issueId={issue.id} />
          </div>

        </div>

        {/* Right column (AI Analysis) */}
        <div className="lg:col-span-1">
          <AiAnalysis issueId={issue.id} />
        </div>

      </div>

      {/* Delete modal */}
      {showDelete && (
        <DeleteConfirm
          title="Delete Issue"
          message={`Are you sure you want to delete "${issue.title}"? This issue will be moved to the Recycle Bin and can be restored later.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
