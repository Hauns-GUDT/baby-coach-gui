import { useEffect } from 'react';

/**
 * Reusable modal dialog shell.
 *
 * Props:
 *   isOpen    – controls visibility
 *   onClose   – called on backdrop click or Escape key
 *   title     – optional header title string
 *   children  – body content
 *   footer    – optional JSX for action buttons (rendered below body)
 *   maxWidth  – Tailwind max-w-* class (default 'max-w-sm')
 */
export default function Dialog({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-sm' }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white dark:bg-navy-700 rounded-2xl border border-blue-grey-100 dark:border-navy-500 overflow-hidden w-full ${maxWidth} flex flex-col`}
      >
        {/* Header */}
        {title && (
          <div className="bg-twilight-indigo-700 dark:bg-navy-800 dark:border-b dark:border-navy-500 px-6 py-4">
            <h2 className="text-lg font-semibold text-white dark:text-navy-50">{title}</h2>
          </div>
        )}

        {/* Body */}
        <div className="p-6 text-sm text-blue-grey-700 dark:text-navy-200">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-6 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
