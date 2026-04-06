import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, Baby, Pencil, Trash2, ChevronLeft, Play } from 'lucide-react';
import IconButton from '../../../shared/components/IconButton';
import Button from '../../../shared/components/Button';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import Pagination from '../../../shared/components/Pagination';
import { parseApiError } from '../../../shared/utils/parseApiError';
import { formatHours, formatTime, toDatetimeLocal } from '../../dashboard/components/widgets/shared/eventWidgetHelpers';

export const TYPE_META = {
  sleep:   { icon: Moon,  color: '#425bbd', i18nPrefix: 'history.sleep' },   // twilight-indigo-500
  feeding: { icon: Milk,  color: '#f5b20a', i18nPrefix: 'history.feeding' }, // light-apricot-500
  diaper:  { icon: Baby,  color: '#34d399', i18nPrefix: 'history.diaper' },
};

const ALL_TYPES = Object.keys(TYPE_META);

function TypeFilterBar({ selectedTypes, onToggle }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 flex-wrap">
      {ALL_TYPES.map((type) => {
        const { icon: Icon, color } = TYPE_META[type];
        const active = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-twilight-indigo-600 border-twilight-indigo-600 text-white'
                : 'bg-white border-blue-grey-200 text-blue-grey-500 hover:border-blue-grey-400'
            }`}
          >
            <Icon size={13} style={{ color: active ? 'white' : color }} strokeWidth={2} />
            {t(`${TYPE_META[type].i18nPrefix}.title`)}
          </button>
        );
      })}
    </div>
  );
}

function EventFormDialog({ type, session, onSave, onCreate, onCancel, onBack }) {
  const { t } = useTranslation();
  const { i18nPrefix } = TYPE_META[type];
  const isEdit = !!session;
  const [startedAt, setStartedAt] = useState(
    session ? toDatetimeLocal(session.startedAt) : toDatetimeLocal(new Date().toISOString())
  );
  const [endedAt, setEndedAt] = useState(
    session?.endedAt ? toDatetimeLocal(session.endedAt) : ''
  );
  const [error, setError]             = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setIsSaving(true);
    try {
      const payload = {
        startedAt: new Date(startedAt).toISOString(),
        ...(endedAt ? { endedAt: new Date(endedAt).toISOString() } : {}),
      };
      if (isEdit) {
        await onSave(session.id, payload);
      } else {
        await onCreate({ type, ...payload });
      }
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
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="text-blue-grey-400 hover:text-blue-grey-600 -ml-1 p-1 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <h2 className="text-lg font-bold text-blue-grey-900">
            {isEdit ? t(`${i18nPrefix}.editSession`) : t(`${i18nPrefix}.newSession`)}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-blue-grey-700">Start</label>
            <input type="datetime-local" required value={startedAt} onChange={(e) => setStartedAt(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300" />
            {fieldErrors.startedAt && <p role="alert" className="text-sm text-rose-600">{fieldErrors.startedAt}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-blue-grey-700">{t(`${i18nPrefix}.end`)}</label>
            <input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)}
              className="border border-blue-grey-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-twilight-indigo-300" />
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

export function AddEventDialog({ onCreate, onCancel }) {
  const { t } = useTranslation();
  const [pickedType, setPickedType] = useState(null);

  if (pickedType) {
    return (
      <EventFormDialog
        type={pickedType}
        session={null}
        onCreate={onCreate}
        onCancel={onCancel}
        onBack={() => setPickedType(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-5">
        <h2 className="text-lg font-bold text-blue-grey-900">{t('tracking.selectEventType')}</h2>
        <div className="flex flex-col gap-3">
          {ALL_TYPES.map((type) => {
            const { icon: Icon, color, i18nPrefix } = TYPE_META[type];
            return (
              <button
                key={type}
                onClick={() => setPickedType(type)}
                className="flex items-center gap-4 w-full rounded-2xl border-2 border-blue-grey-100 p-5 text-left hover:border-blue-grey-300 active:scale-[0.98] transition-all"
              >
                <div className="rounded-xl p-3" style={{ backgroundColor: `${color}22` }}>
                  <Icon size={28} style={{ color }} strokeWidth={1.75} />
                </div>
                <span className="text-lg font-semibold text-blue-grey-800">{t(`${i18nPrefix}.title`)}</span>
              </button>
            );
          })}
        </div>
        <Button variant="secondary" onClick={onCancel}>{t('tracking.cancel')}</Button>
      </div>
    </div>
  );
}

export default function SessionsWidget({ events, page, totalPages, onPageChange, isLoading, onEdit, onDelete, onContinue, hasActiveEvent, selectedTypes, onTypeToggle }) {
  const { t } = useTranslation();
  const [editingSession, setEditingSession] = useState(null);
  const [pendingDelete, setPendingDelete]   = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sessions = events;

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
    <div className="bg-white rounded-2xl border border-blue-grey-100 p-5 flex flex-col gap-3">
      <h2 className="font-semibold text-blue-grey-900 text-lg">{t('tracking.recentSessions')}</h2>

      <TypeFilterBar selectedTypes={selectedTypes} onToggle={onTypeToggle} />

      {isLoading && sessions.length === 0 ? (
        <p className="text-sm text-blue-grey-400">{t('common.loading', 'Loading…')}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-blue-grey-400">{t('tracking.noSessions')}</p>
      ) : (
        <div className="flex flex-col divide-y divide-blue-grey-50">
          {sessions.map((session, idx) => {
            const { icon: Icon, color, i18nPrefix: prefix } = TYPE_META[session.type] ?? TYPE_META.sleep;
            const duration = session.endedAt
              ? (new Date(session.endedAt) - new Date(session.startedAt)) / 3_600_000
              : (now - new Date(session.startedAt)) / 3_600_000;
            const showContinue = idx === 0 && page === 1 && !hasActiveEvent;
            return (
              <div key={session.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Icon size={15} style={{ color }} strokeWidth={2} className="shrink-0" />
                  <p className="text-sm text-blue-grey-700">
                    {formatTime(session.startedAt)}–{session.endedAt ? formatTime(session.endedAt) : t('tracking.now')}
                    <span className="text-blue-grey-300 mx-1">·</span>
                    <span className="text-blue-grey-400 text-xs">{new Date(session.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    <span className="text-blue-grey-300 mx-1">·</span>
                    <span className="text-blue-grey-400 text-xs">{formatHours(duration)}</span>
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {showContinue && (
                    <IconButton icon={Play} label={t('tracking.continue')} className="hover:text-twilight-indigo-600" onClick={() => onContinue(session.id)} />
                  )}
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
        <EventFormDialog
          type={editingSession.type}
          session={editingSession}
          onSave={handleSave}
          onCancel={() => setEditingSession(null)}
        />
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
