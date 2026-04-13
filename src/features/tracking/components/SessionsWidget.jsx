import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Milk, Droplets, Pencil, Trash2, ChevronLeft, CirclePlay, Plus, MessageCircle } from 'lucide-react';
import IconButton from '../../../shared/components/design/IconButton';
import Button from '../../../shared/components/design/Button';
import ConfirmDialog from '../../../shared/components/ConfirmDialog';
import Pagination from '../../../shared/components/design/Pagination';
import { parseApiError } from '../../../shared/utils/parseApiError';
import { formatHours, formatTime, toDatetimeLocal } from '../../dashboard/utils/eventWidgetHelpers';

// Reads a CSS variable from :root (resolves per theme at render time)
function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const TYPE_META = {
  sleep:   { icon: Moon,     colorVar: '--chart-sleep',  i18nPrefix: 'history.sleep' },
  feeding: { icon: Milk,     colorVar: '--chart-feed',   i18nPrefix: 'history.feeding' },
  diaper:  { icon: Droplets, colorVar: '--chart-diaper', i18nPrefix: 'history.diaper' },
};

const ALL_TYPES = Object.keys(TYPE_META);

const SUBTYPE_OPTIONS = {
  diaper:  ['pee', 'poo', 'both'],
  feeding: ['breast', 'bottle', 'pre'],
};

// Per-type active chip style for subtype toggles
const TYPE_ACTIVE_CLS = {
  sleep:   'bg-twilight-indigo-50 border-twilight-indigo-500 text-twilight-indigo-700 dark:bg-sky-500/20 dark:border-sky-500 dark:text-sky-300',
  feeding: 'bg-light-apricot-50 border-light-apricot-500 text-light-apricot-700 dark:bg-light-apricot-400/20 dark:border-light-apricot-400 dark:text-light-apricot-300',
  diaper:  'bg-warm-brown-50 border-warm-brown-500 text-warm-brown-700 dark:bg-navy-400/20 dark:border-navy-300 dark:text-navy-100',
};

const INACTIVE_CLS = 'bg-white border-blue-grey-200 text-blue-grey-600 hover:border-blue-grey-400 dark:bg-navy-600 dark:border-navy-400 dark:text-navy-100 dark:hover:border-navy-300';

// Filter bar chips use twilight-indigo active / blue-grey inactive
const FILTER_ACTIVE_CLS   = 'bg-twilight-indigo-600 border-twilight-indigo-600 text-white dark:bg-sky-500/20 dark:border-sky-500 dark:text-sky-100';
const FILTER_INACTIVE_CLS = 'bg-white border-blue-grey-200 text-blue-grey-500 hover:border-blue-grey-400 dark:bg-navy-600 dark:border-navy-400 dark:text-navy-100 dark:hover:border-navy-300';

function TypeFilterBar({ selectedTypes, onToggle }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-2 flex-wrap">
      {ALL_TYPES.map((type) => {
        const { icon: Icon } = TYPE_META[type];
        const active = selectedTypes.includes(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              active ? FILTER_ACTIVE_CLS : FILTER_INACTIVE_CLS
            }`}
          >
            {/* Icon inherits text color from the button className via currentColor */}
            <Icon size={13} strokeWidth={2} />
            {t(`${TYPE_META[type].i18nPrefix}.title`)}
          </button>
        );
      })}
    </div>
  );
}

function SubTypeToggle({ type, value, onChange }) {
  const { t } = useTranslation();
  const options = SUBTYPE_OPTIONS[type];
  if (!options) return null;
  const { i18nPrefix } = TYPE_META[type];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-blue-grey-700 dark:text-navy-100">{t('common.type')}</label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? null : opt)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
              value === opt ? TYPE_ACTIVE_CLS[type] : INACTIVE_CLS
            }`}
          >
            {t(`${i18nPrefix}.${opt}`)}
          </button>
        ))}
      </div>
    </div>
  );
}

import { inputClass as inputCls, panelClass } from '../../../shared/utils/inputClass';
import FormField from '../../../shared/components/design/FormField';
import Dialog from '../../../shared/components/design/Dialog';

function EventFormDialog({ type, session, onSave, onCreate, onCancel, onBack }) {
  const { t } = useTranslation();
  const { i18nPrefix } = TYPE_META[type];
  const isEdit = !!session;
  const isDiaper = type === 'diaper';

  const [startedAt, setStartedAt] = useState(
    session ? toDatetimeLocal(session.startedAt) : toDatetimeLocal(new Date().toISOString())
  );
  const [endedAt, setEndedAt] = useState(
    session?.endedAt ? toDatetimeLocal(session.endedAt) : ''
  );
  const [subType, setSubType]     = useState(session?.subType ?? null);
  const [ml, setMl]               = useState(session?.ml != null ? String(session.ml) : '');
  const [notes, setNotes]         = useState(session?.notes ?? '');
  const [error, setError]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSaving, setIsSaving]   = useState(false);

  const showMl = type === 'feeding' && (subType === 'bottle' || subType === 'pre');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFieldErrors({}); setIsSaving(true);
    try {
      const mlValue = showMl && ml !== '' ? parseInt(ml, 10) : null;
      const startISO = new Date(startedAt).toISOString();
      const payload = {
        startedAt: startISO,
        // Diaper is point-in-time — endedAt equals startedAt so the interval is closed
        endedAt: isDiaper ? startISO : (endedAt ? new Date(endedAt).toISOString() : null),
        ...(subType ? { subType } : { subType: null }),
        ...(mlValue != null ? { ml: mlValue } : { ml: null }),
        ...(notes.trim() ? { notes: notes.trim() } : { notes: null }),
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

  const dialogHeader = (
    <>
      {onBack && (
        <button onClick={onBack} className="text-twilight-indigo-200 hover:text-white dark:text-navy-200 dark:hover:text-navy-50 -ml-1 p-1 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
      )}
      <h2 className="text-lg font-semibold text-white dark:text-navy-50">
        {isEdit ? t(`${i18nPrefix}.editSession`) : t(`${i18nPrefix}.newSession`)}
      </h2>
    </>
  );

  return (
    <Dialog isOpen onClose={onCancel} header={dialogHeader}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <FormField label={isDiaper ? t('common.time') : 'Start'} htmlFor="ef-start" error={fieldErrors.startedAt}>
          <input
            id="ef-start"
            type="datetime-local"
            required
            value={startedAt}
            onChange={(e) => setStartedAt(e.target.value)}
            className={inputCls}
          />
        </FormField>

        {/* End time — hidden for diaper (point-in-time events) */}
        {!isDiaper && (
          <FormField label={t(`${i18nPrefix}.end`)} htmlFor="ef-end" error={fieldErrors.endedAt}>
            <input
              id="ef-end"
              type="datetime-local"
              value={endedAt}
              onChange={(e) => setEndedAt(e.target.value)}
              className={inputCls}
            />
          </FormField>
        )}

        {/* SubType toggle for diaper and feeding */}
        <SubTypeToggle type={type} value={subType} onChange={(v) => { setSubType(v); if (v !== 'bottle' && v !== 'pre') setMl(''); }} />

        {/* ml input — only for bottle/pre feeding */}
        {showMl && (
          <FormField label={t('common.ml')} htmlFor="ef-ml">
            <input
              id="ef-ml"
              type="number"
              min="0"
              step="1"
              value={ml}
              onChange={(e) => setMl(e.target.value)}
              placeholder={t('common.mlPlaceholder')}
              className={inputCls}
            />
          </FormField>
        )}

        {/* Notes — available for all event types */}
        <FormField label={t('common.notes')} htmlFor="ef-notes">
          <textarea
            id="ef-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('common.notesPlaceholder')}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </FormField>

        {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
        <div className="flex gap-3 justify-end mt-1">
          <Button variant="secondary" className="py-2 text-sm" type="button" onClick={onCancel}>
            {t(`${i18nPrefix}.cancel`)}
          </Button>
          <Button variant="primary" className="py-2 text-sm" type="submit" disabled={isSaving}>
            {isSaving ? t(`${i18nPrefix}.saving`) : t(`${i18nPrefix}.save`)}
          </Button>
        </div>
      </form>
    </Dialog>
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
      <div className="relative bg-white dark:bg-navy-700 rounded-2xl overflow-hidden w-full max-w-sm flex flex-col">
        {/* Nav-style header */}
        <div className="bg-twilight-indigo-700 dark:bg-navy-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-white dark:text-navy-50">{t('tracking.selectEventType')}</h2>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {ALL_TYPES.map((type) => {
              const { icon: Icon, colorVar, i18nPrefix } = TYPE_META[type];
              const color = getCssVar(colorVar);
              return (
                <button
                  key={type}
                  onClick={() => setPickedType(type)}
                  className="flex items-center gap-4 w-full rounded-2xl border-2 border-blue-grey-100 bg-white hover:border-blue-grey-300 dark:border-navy-500 dark:bg-navy-600 dark:hover:border-navy-400 p-5 text-left active:scale-[0.98] transition-all"
                >
                  <div className="rounded-xl p-3" style={{ backgroundColor: `${color}22` }}>
                    <Icon size={28} style={{ color }} strokeWidth={1.75} />
                  </div>
                  <span className="text-lg font-semibold text-blue-grey-800 dark:text-navy-50">{t(`${i18nPrefix}.title`)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" className="py-2 text-sm" onClick={onCancel}>{t('tracking.cancel')}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionsWidget({ events, page, totalPages, onPageChange, isLoading, onEdit, onDelete, onContinue, hasActiveEvent, selectedTypes, onTypeToggle, onAdd }) {
  const { t } = useTranslation();
  const [editingSession, setEditingSession] = useState(null);
  const [pendingDelete, setPendingDelete]   = useState(null);
  const [expandedNotes, setExpandedNotes]   = useState(new Set()); // IDs with notes expanded on mobile
  const [now, setNow] = useState(() => new Date());
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Only show skeleton if loading takes longer than 50ms to avoid flicker on fast responses
  useEffect(() => {
    if (!isLoading) { setShowSkeleton(false); return; }
    const id = setTimeout(() => setShowSkeleton(true), 50);
    return () => clearTimeout(id);
  }, [isLoading]);

  const sessions = events;

  const handleSave = async (id, payload) => {
    await onEdit(id, payload);
    setEditingSession(null);
  };

  const handleDelete = async () => {
    await onDelete(pendingDelete.id);
    setPendingDelete(null);
  };

  const toggleNote = (id) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const i18nPrefix = pendingDelete ? TYPE_META[pendingDelete.type].i18nPrefix : 'history.sleep';

  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-blue-grey-900 dark:text-navy-50 text-lg">{t('tracking.recentSessions')}</h2>
        {onAdd && (
          <Button
            onClick={onAdd}
            variant="primary"
            size='sm'
            aria-label={t('tracking.addEvent')}
          >
            <Plus size={16} strokeWidth={2.5} />
          </Button>
        )}
      </div>
      <TypeFilterBar selectedTypes={selectedTypes} onToggle={onTypeToggle} />

      {showSkeleton ? (
        // Skeleton — shown on first load and during pagination
        <div className="flex flex-col animate-pulse">
          {[3, 2].map((rowCount, gi) => (
            <div key={gi}>
              <div className="h-3 w-20 rounded bg-blue-grey-100 dark:bg-navy-600 mt-3 mb-2" />
              <div className="flex flex-col divide-y divide-blue-grey-50 dark:divide-navy-600">
                {Array.from({ length: rowCount }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-blue-grey-100 dark:bg-navy-600 shrink-0" />
                      <div className="flex flex-col gap-1.5">
                        <div className="h-3 rounded bg-blue-grey-100 dark:bg-navy-600" style={{ width: `${90 + (i * 24) % 60}px` }} />
                        {i % 2 === 0 && <div className="h-2.5 w-14 rounded bg-blue-grey-100 dark:bg-navy-600" />}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-grey-100 dark:bg-navy-600" />
                      <div className="w-7 h-7 rounded-lg bg-blue-grey-100 dark:bg-navy-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-blue-grey-400 dark:text-navy-200">{t('tracking.noSessions')}</p>
      ) : (
        <div className="flex flex-col">
          {/* Group sessions by calendar day */}
          {Object.entries(
            sessions.reduce((groups, session) => {
              const day = new Date(session.startedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
              (groups[day] ??= []).push(session);
              return groups;
            }, {})
          ).map(([day, daySessions]) => (
            <div key={day}>
              <p className="text-xs font-semibold text-blue-grey-400 dark:text-navy-300 pt-3 pb-1 uppercase tracking-wide">{day}</p>
              <div className="flex flex-col divide-y divide-blue-grey-50 dark:divide-navy-600">
                {daySessions.map((session) => {
                  const globalIdx = sessions.indexOf(session);
                  const idx = globalIdx;
                  const { icon: Icon, colorVar, i18nPrefix: prefix } = TYPE_META[session.type] ?? TYPE_META.sleep;
                  const color = getCssVar(colorVar);
                  const duration = session.endedAt
                    ? (new Date(session.endedAt) - new Date(session.startedAt)) / 3_600_000
                    : (now - new Date(session.startedAt)) / 3_600_000;
                  const showContinue = idx === 0 && page === 1 && !hasActiveEvent && session.type !== 'diaper';
                  const hasNotes = !!session.notes;
                  const noteExpanded = expandedNotes.has(session.id);
                  const subTypeLabel = session.subType
                    ? t(`${prefix}.${session.subType}`, session.subType)
                    : null;
                  const mlLabel = session.ml != null ? `${session.ml} ml` : null;

            return (
              <div key={session.id} className="flex flex-col py-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={15} style={{ color }} strokeWidth={2} className="shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm text-blue-grey-700 dark:text-navy-100">
                        {formatTime(session.startedAt)}
                        {/* Diaper is point-in-time, skip range */}
                        {session.type !== 'diaper' && (
                          <>–{session.endedAt ? formatTime(session.endedAt) : t('tracking.now')}</>
                        )}
                        {session.type !== 'diaper' && (
                          <>
                            <span className="text-blue-grey-300 dark:text-navy-300 mx-1">·</span>
                            <span className="text-blue-grey-400 dark:text-navy-200 text-xs">{formatHours(duration)}</span>
                          </>
                        )}
                      </p>
                      {/* SubType + ml badge */}
                      {(subTypeLabel || mlLabel) && (
                        <span className="text-xs text-blue-grey-400 dark:text-navy-200 mt-0.5">
                          {[subTypeLabel, mlLabel].filter(Boolean).join(' · ')}
                        </span>
                      )}
                      {/* Notes inline on sm+ screens */}
                      {hasNotes && (
                        <p className="hidden sm:block text-xs text-blue-grey-400 dark:text-navy-200 mt-0.5 truncate max-w-55">{session.notes}</p>
                      )}
                      {/* Notes expanded on mobile */}
                      {hasNotes && noteExpanded && (
                        <p className="sm:hidden text-xs text-blue-grey-400 dark:text-navy-200 mt-1 wrap-break-word">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {/* Notes toggle icon — mobile only */}
                    {hasNotes && (
                      <button
                        onClick={() => toggleNote(session.id)}
                        aria-label={t('common.notes')}
                        className={`sm:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          noteExpanded ? 'text-twilight-indigo-600 dark:text-sky-400' : 'text-blue-grey-400 hover:text-blue-grey-600 dark:text-navy-300 dark:hover:text-navy-100'
                        }`}
                      >
                        <MessageCircle size={15} />
                      </button>
                    )}
                    {showContinue && (
                      <IconButton icon={CirclePlay} label={t('tracking.continue')} className="hover:text-twilight-indigo-600 dark:hover:text-sky-400" onClick={() => onContinue(session.id)} />
                    )}
                    <IconButton icon={Pencil} label={t(`${prefix}.editSession`)} onClick={() => setEditingSession(session)} />
                    <IconButton icon={Trash2} label={t(`${prefix}.delete`)} className="hover:text-red-500" onClick={() => setPendingDelete({ id: session.id, type: session.type })} />
                  </div>
                </div>
              </div>
            );
                })}
              </div>
            </div>
          ))}
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
