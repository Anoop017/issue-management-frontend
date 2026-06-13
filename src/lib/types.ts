export type IssueStatus = 'open' | 'in-progress' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high';

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Comment {
  id: number;
  issueId: number;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface IssueFilters {
  search?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateIssueData {
  title: string;
  description: string;
  priority?: IssuePriority;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
}

export interface CreateCommentData {
  content: string;
  authorName: string;
}

export interface UpdateCommentData {
  content?: string;
}

export interface AiAnalysisResult {
  issueId: number;
  summary: string;
  severity: string;
  possibleCauses: string[];
  recommendedActions: string[];
  missingInformation: string[];
}
