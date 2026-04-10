import Button from './Button';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white dark:bg-navy-700 rounded-2xl overflow-hidden w-full max-w-sm flex flex-col">
        {/* Nav-style header */}
        <div className="bg-twilight-indigo-700 dark:bg-navy-700 dark:border-b dark:border-navy-500 px-6 py-4">
          <h2 className="text-lg font-semibold text-white dark:text-navy-50">{title}</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          {message && <p className="text-sm text-blue-grey-600 dark:text-navy-200">{message}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" className="py-2 text-sm" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="danger" className="py-2 text-sm" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
