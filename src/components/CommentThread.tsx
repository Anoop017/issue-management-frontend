'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { Comment } from '@/lib/types';
import { getComments, createComment, deleteComment, updateComment } from '@/lib/api';
import DeleteConfirm from '@/components/DeleteConfirm';

interface CommentThreadProps {
  issueId: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommentThread({ issueId }: CommentThreadProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Fetch comments (may already be prefetched from list page) ──
  const { data: commentsData, isLoading: loading } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => getComments(issueId, { limit: 50, order: 'asc' }),
  });

  const comments: Comment[] = commentsData?.data ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setSubmitting(true);
    try {
      await toast.promise(createComment(issueId, {
        content: content.trim(),
        authorName: authorName.trim(),
      }), {
        loading: 'Posting comment...',
        success: <b>Comment posted!</b>,
        error: <b>Could not post comment.</b>,
      });
      setContent('');
      // Invalidate to refetch with new comment
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(commentId: number) {
    setDeleteCommentId(commentId);
  }

  async function confirmDelete() {
    if (deleteCommentId === null) return;
    setDeleteLoading(true);
    try {
      await toast.promise(deleteComment(issueId, deleteCommentId), {
        loading: 'Deleting comment...',
        success: <b>Comment deleted!</b>,
        error: <b>Could not delete comment.</b>,
      });
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      setDeleteCommentId(null);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeleteLoading(false);
    }
  }

  function startEditComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditCommentContent(comment.content);
  }

  async function handleSaveEdit() {
    if (editingCommentId === null || !editCommentContent.trim()) return;
    try {
      await toast.promise(updateComment(issueId, editingCommentId, { content: editCommentContent.trim() }), {
        loading: 'Updating comment...',
        success: <b>Comment updated!</b>,
        error: <b>Could not update comment.</b>,
      });
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
      setEditingCommentId(null);
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold">
          Discussion <span className="text-muted font-normal">({comments.length})</span>
        </h3>
      </div>

      {loading ? (
        <p className="text-sm text-muted py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted py-4 mb-6">
          No comments yet. Start the discussion below.
        </p>
      ) : (
        <div className="space-y-6 mb-8 border-b border-border pb-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {comment.authorName.charAt(0).toUpperCase()}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{comment.authorName}</span>
                    <span className="text-xs text-muted">{formatDate(comment.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditComment(comment)} className="text-muted hover:text-foreground cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="text-danger hover:text-danger-hover cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleSaveEdit} className="text-xs text-primary hover:underline cursor-pointer">
                        Save
                      </button>
                      <button onClick={() => setEditingCommentId(null)} className="text-xs text-muted hover:underline cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="border border-border rounded-xl p-4 bg-white shadow-sm">
        <h4 className="text-sm font-semibold mb-3">Add a comment</h4>
        <div className="space-y-3">
          <input
            id="comment-author"
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <textarea
            id="comment-content"
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="submit"
            disabled={submitting || !content.trim() || !authorName.trim()}
            className="px-5 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Delete modal */}
      {deleteCommentId !== null && (
        <DeleteConfirm
          title="Delete Comment"
          message="Are you sure you want to delete this comment? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteCommentId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
