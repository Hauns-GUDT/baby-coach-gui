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
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-900">{title}</h2>
        {message && <p className="text-sm text-zinc-600">{message}</p>}
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
  );
}
