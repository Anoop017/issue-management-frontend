'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getDeletedIssues, restoreIssue, permanentDeleteIssue, bulkRestore, bulkPermanentDelete } from '@/lib/api';
import type { Issue } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import Pagination from '@/components/Pagination';
import DeleteConfirm from '@/components/DeleteConfirm';

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function RecycleBinPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const unwrappedParams = use(searchParams);
  const router = useRouter();
  const queryClient = useQueryClient();
  const page = unwrappedParams.page ? parseInt(unwrappedParams.page, 10) : 1;
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['deleted-issues', page],
    queryFn: () => getDeletedIssues(page, limit),
  });

  const issues = data?.data ?? [];
  const meta = data?.meta;

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Bulk selection state ──────────────────────────────
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkRestore, setShowBulkRestore] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkRestoreLoading, setBulkRestoreLoading] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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

  async function handleRestore(issue: Issue) {
    try {
      await toast.promise(restoreIssue(issue.id), {
        loading: 'Restoring issue...',
        success: <b>Issue restored!</b>,
        error: <b>Could not restore issue.</b>,
      });
      queryClient.invalidateQueries({ queryKey: ['deleted-issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    } catch (err) {
      console.error('Failed to restore:', err);
    }
  }

  async function handlePermanentDelete() {
    if (deleteId === null) return;
    setDeleteLoading(true);
    try {
      await toast.promise(permanentDeleteIssue(deleteId), {
        loading: 'Deleting permanently...',
        success: <b>Issue permanently deleted!</b>,
        error: <b>Could not delete issue.</b>,
      });
      queryClient.invalidateQueries({ queryKey: ['deleted-issues'] });
    } catch (err) {
      console.error('Failed to permanently delete:', err);
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  }

  async function handleBulkRestore() {
    if (selectedIds.length === 0) return;
    setBulkRestoreLoading(true);
    try {
      await toast.promise(bulkRestore(selectedIds), {
        loading: 'Restoring issues...',
        success: <b>Issues restored!</b>,
        error: <b>Could not restore issues.</b>,
      });
      setSelectedIds([]);
      setShowBulkRestore(false);
      queryClient.invalidateQueries({ queryKey: ['deleted-issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    } catch (err) {
      console.error('Failed to bulk restore:', err);
    } finally {
      setBulkRestoreLoading(false);
    }
  }

  async function handleBulkPermanentDelete() {
    if (selectedIds.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      await toast.promise(bulkPermanentDelete(selectedIds), {
        loading: 'Deleting permanently...',
        success: <b>Issues permanently deleted!</b>,
        error: <b>Could not delete issues.</b>,
      });
      setSelectedIds([]);
      setShowBulkDelete(false);
      queryClient.invalidateQueries({ queryKey: ['deleted-issues'] });
    } catch (err) {
      console.error('Failed to bulk delete:', err);
    } finally {
      setBulkDeleteLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Recycle Bin</h1>
            <p className="text-muted mt-1">Manage and recover deleted issues.</p>
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['deleted-issues'] })}
            className="p-2 text-muted hover:text-foreground border border-border rounded-lg hover:bg-sidebar-hover transition-colors cursor-pointer mt-1"
            title="Refresh recycle bin"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowBulkRestore(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Restore Selected ({selectedIds.length})
            </button>
            <button
              onClick={() => setShowBulkDelete(true)}
              className="flex items-center gap-2 px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger-hover transition-colors cursor-pointer"
            >
              Delete Forever ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="inline-block w-8 h-8 border-2 border-border border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-danger">
            <p>Failed to load recycle bin.</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-16 text-center text-muted">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <p className="text-lg font-medium text-foreground mb-1">Recycle Bin is Empty</p>
            <p className="text-sm">There are no deleted issues here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-sidebar-bg">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer w-4 h-4"
                      checked={issues.length > 0 && selectedIds.length === issues.length}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Title</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Priority</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">Deleted At</th>
                  <th className="py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-sidebar-hover transition-colors">
                    <td className="py-4 px-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer w-4 h-4"
                        checked={selectedIds.includes(issue.id)}
                        onChange={() => handleToggleSelect(issue.id)}
                      />
                    </td>
                    <td className="py-4 px-4 text-sm text-muted font-mono whitespace-nowrap">
                      {issue.id}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-foreground">{issue.title}</p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="py-4 px-4 text-sm text-muted whitespace-nowrap">
                      {formatDate(issue.deletedAt)}
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(issue)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => setDeleteId(issue.id)}
                          className="px-3 py-1.5 text-xs font-medium text-danger border border-danger/30 hover:bg-danger/5 rounded-lg transition-colors cursor-pointer"
                        >
                          Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <Pagination
          meta={meta}
          onPageChange={(p) => router.push(`/recycle-bin?page=${p}`)}
        />
      )}

      {deleteId !== null && (
        <DeleteConfirm
          title="Permanent Delete"
          message="Are you sure you want to permanently delete this issue? This action cannot be undone and all associated comments will be lost."
          onConfirm={handlePermanentDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}

      {showBulkRestore && (
        <DeleteConfirm
          title="Restore Selected Issues"
          message={`Are you sure you want to restore ${selectedIds.length} selected issue(s)? They will be moved back to your active issues list.`}
          onConfirm={handleBulkRestore}
          onCancel={() => setShowBulkRestore(false)}
          loading={bulkRestoreLoading}
          confirmText="Restore"
          loadingText="Restoring..."
          isDanger={false}
        />
      )}

      {showBulkDelete && (
        <DeleteConfirm
          title="Permanently Delete Selected Issues"
          message={`Are you sure you want to permanently delete ${selectedIds.length} selected issue(s)? This action cannot be undone and all associated comments will be lost.`}
          onConfirm={handleBulkPermanentDelete}
          onCancel={() => setShowBulkDelete(false)}
          loading={bulkDeleteLoading}
        />
      )}
    </div>
  );
}
