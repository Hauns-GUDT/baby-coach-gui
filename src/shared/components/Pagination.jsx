import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange, isLoading = false }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
        aria-label="Previous page"
        className="p-1 rounded-lg text-blue-grey-400 hover:text-blue-grey-900 hover:bg-blue-grey-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-sm text-blue-grey-400 tabular-nums">
        {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isLoading}
        aria-label="Next page"
        className="p-1 rounded-lg text-blue-grey-400 hover:text-blue-grey-900 hover:bg-blue-grey-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
