import type {
  Comment,
  CreateCommentData,
  CreateIssueData,
  Issue,
  IssueFilters,
  PaginatedResponse,
  UpdateCommentData,
  UpdateIssueData,
} from './types';

const API_BASE = '/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
}

// ─── Issues ──────────────────────────────────────────────

export async function getIssues(
  filters?: IssueFilters,
): Promise<PaginatedResponse<Issue>> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    });
  }
  const qs = params.toString();
  return fetchAPI<PaginatedResponse<Issue>>(`/issues${qs ? `?${qs}` : ''}`);
}

export async function getIssue(id: number): Promise<Issue> {
  return fetchAPI<Issue>(`/issues/${id}`);
}

export async function analyzeIssue(id: number): Promise<any> {
  return fetchAPI<any>(`/issues/${id}/analyze`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function createIssue(data: CreateIssueData): Promise<Issue> {
  return fetchAPI<Issue>('/issues', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateIssue(
  id: number,
  data: UpdateIssueData,
): Promise<Issue> {
  return fetchAPI<Issue>(`/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteIssue(id: number): Promise<void> {
  await fetchAPI(`/issues/${id}`, { method: 'DELETE' });
}

export async function permanentDeleteIssue(id: number): Promise<void> {
  await fetchAPI(`/issues/${id}/permanent`, { method: 'DELETE' });
}

export async function restoreIssue(id: number): Promise<void> {
  await fetchAPI(`/issues/${id}/restore`, { method: 'PATCH' });
}

export async function getDeletedIssues(
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<Issue>> {
  return fetchAPI<PaginatedResponse<Issue>>(`/issues/deleted/bin?page=${page}&limit=${limit}`);
}

export async function bulkSoftDelete(ids: number[]): Promise<any> {
  return fetchAPI('/issues/bulk/soft-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export async function bulkPermanentDelete(ids: number[]): Promise<any> {
  return fetchAPI('/issues/bulk/permanent', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function bulkRestore(ids: number[]): Promise<any> {
  return fetchAPI('/issues/bulk/restore', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
}

// ─── Comments ────────────────────────────────────────────

export async function getComments(
  issueId: number,
  params?: { page?: number; limit?: number; sortBy?: string; order?: string },
): Promise<PaginatedResponse<Comment>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.set(key, String(value));
    });
  }
  const qs = searchParams.toString();
  return fetchAPI<PaginatedResponse<Comment>>(
    `/issues/${issueId}/comments${qs ? `?${qs}` : ''}`,
  );
}

export async function createComment(
  issueId: number,
  data: CreateCommentData,
): Promise<Comment> {
  return fetchAPI<Comment>(`/issues/${issueId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateComment(
  issueId: number,
  commentId: number,
  data: UpdateCommentData,
): Promise<Comment> {
  return fetchAPI<Comment>(`/issues/${issueId}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteComment(
  issueId: number,
  commentId: number,
): Promise<void> {
  await fetchAPI(`/issues/${issueId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}
