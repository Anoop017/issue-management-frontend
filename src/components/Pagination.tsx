'use client';

import type { PaginationMeta } from '@/lib/types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, limit, total, totalPages } = meta;

  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Calculate visible page numbers (max 5, centered on current)
  let startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  const pages: number[] = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
      <span className="text-sm text-muted">
        Showing {start} to {end} of {total} issues
      </span>
      <div className="flex items-center gap-1">
        <button
          id="pagination-prev"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2.5 py-1.5 text-sm rounded-md border border-border hover:bg-sidebar-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] py-1.5 text-sm cursor-pointer rounded-md transition-colors ${p === page
                ? 'bg-black text-white font-medium'
                : 'border border-border hover:bg-sidebar-hover'
              }`}
          >
            {p}
          </button>
        ))}
        <button
          id="pagination-next"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2.5 py-1.5 text-sm rounded-md border border-border hover:bg-sidebar-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  );
}
