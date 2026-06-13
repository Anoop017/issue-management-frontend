'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type {
  Issue,
  IssueStatus,
  IssuePriority,
  PaginationMeta,
  CreateIssueData,
  UpdateIssueData,
} from '@/lib/types';
import { getIssues, getComments, createIssue, updateIssue, deleteIssue, bulkSoftDelete } from '@/lib/api';
import IssueFilters from '@/components/IssueFilters';
import IssueTable from '@/components/IssueTable';
import Pagination from '@/components/Pagination';
import IssueForm from '@/components/IssueForm';
import DeleteConfirm from '@/components/DeleteConfirm';
import { useDebounce } from '@/hooks/useDebounce';

function IssuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // ─── Filter state (driven by URL) ─────────────────────
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [status, setStatus] = useState<IssueStatus | ''>(
    (searchParams.get('status') as IssueStatus) ?? '',
  );
  const [priority, setPriority] = useState<IssuePriority | ''>(
    (searchParams.get('priority') as IssuePriority) ?? '',
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // ─── Modal state ───────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<Issue | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Bulk selection state ──────────────────────────────
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  // ─── Fetch issues with React Query ─────────────────────
  const {
    data: issuesData,
    isLoading: loading,
  } = useQuery({
    queryKey: ['issues', { search: debouncedSearch, status, priority, page }],
    queryFn: () =>
      getIssues({
        search: debouncedSearch || undefined,
        status: status || undefined,
        priority: priority || undefined,
        page,
        limit: 10,
      }),
  });

  const issues = issuesData?.data ?? [];
  const meta: PaginationMeta = issuesData?.meta ?? {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  // ─── Prefetch comments + seed issue cache for visible issues ───
  useEffect(() => {
    if (issues.length > 0) {
      issues.forEach((issue) => {
        // Seed individual issue detail cache (avoids refetch on detail page)
        queryClient.setQueryData(['issue', issue.id], issue);

        // Prefetch comments in the background
        queryClient.prefetchQuery({
          queryKey: ['comments', issue.id],
          queryFn: () => getComments(issue.id, { limit: 50, order: 'asc' }),
        });
      });
    }
  }, [issues, queryClient]);

  // ─── Sync filters → URL ───────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    if (page > 1) params.set('page', String(page));
    const qs = params.toString();
    router.replace(`/issues${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [debouncedSearch, status, priority, page, router]);

  // ─── Reset page on filter change ──────────────────────
  useEffect(() => {
    setPage(1);
    setSelectedIds([]); // Clear selection when filters change
  }, [debouncedSearch, status, priority]);

  // ─── Handlers ──────────────────────────────────────────
  async function handleCreateOrUpdate(data: CreateIssueData | UpdateIssueData) {
    const action = editingIssue
      ? updateIssue(editingIssue.id, data as UpdateIssueData)
      : createIssue(data as CreateIssueData);

    await toast.promise(action, {
      loading: editingIssue ? 'Updating issue...' : 'Creating issue...',
      success: <b>{editingIssue ? 'Issue updated!' : 'Issue created!'}</b>,
      error: <b>Could not save issue.</b>,
    });

    setShowForm(false);
    setEditingIssue(null);
    // Invalidate issues list to refetch
    queryClient.invalidateQueries({ queryKey: ['issues'] });
  }

  async function handleDelete() {
    if (!deletingIssue) return;
    setDeleteLoading(true);
    
    try {
      await toast.promise(deleteIssue(deletingIssue.id), {
        loading: 'Deleting issue...',
        success: <b>Issue deleted!</b>,
        error: <b>Could not delete issue.</b>,
      });

      setDeletingIssue(null);
      // Invalidate issues list + remove cached issue/comments
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.removeQueries({ queryKey: ['issue', deletingIssue.id] });
      queryClient.removeQueries({ queryKey: ['comments', deletingIssue.id] });
    } catch (err) {
      console.error('Failed to delete issue:', err);
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleToggleSelect(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function handleToggleSelectAll() {
    if (selectedIds.length === issues.length && issues.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(issues.map((i) => i.id));
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      await toast.promise(bulkSoftDelete(selectedIds), {
        loading: 'Deleting issues...',
        success: <b>Issues moved to recycle bin!</b>,
        error: <b>Could not delete issues.</b>,
      });
      setSelectedIds([]);
      setShowBulkDelete(false);
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['deleted-issues'] });
    } catch (err) {
      console.error('Failed to bulk delete issues:', err);
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Issue Management Platform
            </h1>
            <p className="text-sm text-muted mt-1">
              Manage and track project issues efficiently
            </p>
          </div>
          <button
            id="new-issue-btn"
            onClick={() => {
              setEditingIssue(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Issue
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <IssueFilters
              search={search}
              status={status}
              priority={priority}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onPriorityChange={setPriority}
            />
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['issues'] })}
              className="p-2 text-muted hover:text-foreground border border-border rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Refresh issues"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDelete(true)}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger-hover transition-colors cursor-pointer shrink-0 mt-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white border border-border rounded-xl p-6">
          {loading ? (
            <div className="text-center py-16 text-muted">
              <div className="inline-block w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading issues...</p>
            </div>
          ) : (
            <>
              <IssueTable
                issues={issues}
                onEdit={(issue) => {
                  setEditingIssue(issue);
                  setShowForm(true);
                }}
                onDelete={(issue) => setDeletingIssue(issue)}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
              />
              <Pagination meta={meta} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <IssueForm
          issue={editingIssue}
          onSubmit={handleCreateOrUpdate}
          onClose={() => {
            setShowForm(false);
            setEditingIssue(null);
          }}
        />
      )}
      {/* Delete modal */}
      {deletingIssue && (
        <DeleteConfirm
          title="Delete Issue"
          message={`Are you sure you want to delete "${deletingIssue.title}"? This issue will be moved to the Recycle Bin.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingIssue(null)}
          loading={deleteLoading}
        />
      )}

      {/* Bulk Delete modal */}
      {showBulkDelete && (
        <DeleteConfirm
          title="Delete Selected Issues"
          message={`Are you sure you want to delete ${selectedIds.length} selected issue(s)? They will be moved to the Recycle Bin.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
          loading={bulkDeleteLoading}
        />
      )}
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8 text-muted">
          <div className="inline-block w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      }
    >
      <IssuesContent />
    </Suspense>
  );
}
