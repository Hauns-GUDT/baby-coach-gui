import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, Pencil, Trash2 } from 'lucide-react';
import IconButton from '../../../shared/components/IconButton';
import Button from '../../../shared/components/Button';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import Pagination from '../../../shared/components/Pagination';
import { parseApiError } from '../../../shared/utils/parseApiError';
import { formatHours, formatTime, toDatetimeLocal } from '../../dashboard/components/widgets/shared/eventWidgetHelpers';

const TYPE_META = {
  sleep:   { icon: Moon,  color: '#818cf8', i18nPrefix: 'history.sleep' },
  feeding: { icon: Milk,  color: '#f97316', i18nPrefix: 'history.feeding' },
};

function EditDialog({ session, onSave, onCancel }) {
  const { t } = useTranslation();
  const { i18nPrefix } = TYPE_META[session.type];
  const [startedAt, setStartedAt] = useState(toDatetimeLocal(session.startedAt));
  const [endedAt, setEndedAt]     = useState(session.endedAt ? toDatetimeLocal(session.endedAt) : '');
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setIsSaving(true);
    try {
      await onSave(session.id, {
        startedAt: new Date(startedAt).toISOString(),
        ...(endedAt ? { endedAt: new Date(endedAt).toISOString() } : {}),
      });
    } catch (err) {
      const { fieldErrors: fe, code } = parseApiError(err);
      if (fe && Object.keys(fe).length > 0) {
        const translated = {};
        for (const [field, errorCode] of Object.entries(fe)) {
          translated[field] = t(`validation.${errorCode}`, t('validation.fallback'));
        }
        setFieldErrors(translated);
      } else {
        setError(code ? t(`validation.${code}`, t(`${i18nPrefix}.saveFailed`)) : t(`${i18nPrefix}.saveFailed`));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-900">{t(`${i18nPrefix}.editSession`)}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">Start</label>
            <input type="datetime-local" required value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
              className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            {fieldErrors.startedAt && <p role="alert" className="text-sm text-rose-600">{fieldErrors.startedAt}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-zinc-700">{t(`${i18nPrefix}.end`)}</label>
            <input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)}
              className="border border-zinc-300 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            {fieldErrors.endedAt && <p role="alert" className="text-sm text-rose-600">{fieldErrors.endedAt}</p>}
          </div>
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-3 justify-end mt-1">
            <Button variant="secondary" className="py-2 text-sm" type="button" onClick={onCancel}>
              {t(`${i18nPrefix}.cancel`)}
            </Button>
            <Button variant="primary" className="py-2 text-sm" type="submit" disabled={isSaving}>
              {isSaving ? t(`${i18nPrefix}.saving`) : t(`${i18nPrefix}.save`)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SessionsWidget({ events, page, totalPages, onPageChange, isLoading, onEdit, onDelete }) {
  const { t } = useTranslation();
  const [editingSession, setEditingSession] = useState(null);
  const [pendingDelete, setPendingDelete]   = useState(null);

  const sessions = events.filter((e) => e.endedAt);

  const handleSave = async (id, payload) => {
    await onEdit(id, payload);
    setEditingSession(null);
  };

  const handleDelete = async () => {
    await onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  const i18nPrefix = pendingDelete ? TYPE_META[pendingDelete.type].i18nPrefix : 'history.sleep';

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
      <h2 className="font-semibold text-zinc-900 text-lg">{t('tracking.recentSessions')}</h2>

      {isLoading ? (
        <p className="text-sm text-zinc-400">{t('common.loading', 'Loading…')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-zinc-400">{t('tracking.noSessions')}</p>
      ) : (
        <div className="flex flex-col divide-y divide-zinc-50">
          {sessions.map((session) => {
            const { icon: Icon, color, i18nPrefix: prefix } = TYPE_META[session.type];
            const duration = (new Date(session.endedAt) - new Date(session.startedAt)) / 3_600_000;
            return (
              <div key={session.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Icon size={15} style={{ color }} strokeWidth={2} className="shrink-0" />
                  <div>
                    <p className="text-sm text-zinc-700">
                      {formatTime(session.startedAt)}–{formatTime(session.endedAt)}
                      <span className="text-zinc-400 ml-1">·</span>
                      <span className="text-zinc-400 ml-1 text-xs">{new Date(session.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </p>
                    <p className="text-xs text-zinc-400">{t(`${prefix}.title`)} · {formatHours(duration)}</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <IconButton icon={Pencil} label={t(`${prefix}.editSession`)} onClick={() => setEditingSession(session)} />
                  <IconButton icon={Trash2} label={t(`${prefix}.delete`)} className="hover:text-red-500" onClick={() => setPendingDelete({ id: session.id, type: session.type })} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} isLoading={isLoading} />

      {editingSession && (
        <EditDialog session={editingSession} onSave={handleSave} onCancel={() => setEditingSession(null)} />
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={t(`${i18nPrefix}.deleteSession`)}
        message={t(`${i18nPrefix}.deleteSessionMessage`)}
        confirmLabel={t(`${i18nPrefix}.delete`)}
        cancelLabel={t(`${i18nPrefix}.cancel`)}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
