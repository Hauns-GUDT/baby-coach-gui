import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange, isLoading = false }) {
  if (totalPages <= 1) return null;

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-150 ' +
    'disabled:opacity-35 disabled:cursor-not-allowed';
  const btnActive =
    'border-twilight-indigo-200 text-twilight-indigo-600 bg-twilight-indigo-50 ' +
    'hover:bg-twilight-indigo-100 hover:border-twilight-indigo-300 active:scale-95 shadow-sm';
  const btnDisabled = 'border-transparent text-twilight-indigo-300 bg-transparent';

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isLoading}
        aria-label="Previous page"
        className={`${btnBase} ${page <= 1 || isLoading ? btnDisabled : btnActive}`}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      <span className="min-w-16 text-center text-sm font-medium text-twilight-indigo-500 tabular-nums">
        {page} <span className="text-twilight-indigo-300">/</span> {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isLoading}
        aria-label="Next page"
        className={`${btnBase} ${page >= totalPages || isLoading ? btnDisabled : btnActive}`}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
