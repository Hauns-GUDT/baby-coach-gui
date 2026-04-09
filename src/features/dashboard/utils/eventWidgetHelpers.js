// ─── Clock period splitting ───────────────────────────────────────────────────

export function clockSplitPeriods(periods, offset = 0) {
  return {
    am: periods.flatMap((p) => {
      const from = Math.max(offset, p.fromH);
      const to = Math.min(offset + 12, p.toH);
      return from < to ? [{ fromH: from - offset, toH: to - offset }] : [];
    }),
    pm: periods.flatMap((p) => {
      const from = Math.max(offset + 12, p.fromH);
      const to = Math.min(offset + 24, p.toH);
      return from < to ? [{ fromH: from - offset - 12, toH: to - offset - 12 }] : [];
    }),
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatHours(h) {
  const totalMins = Math.round(h * 60);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function formatElapsed(ms, t, i18nPrefix) {
  const totalMins = Math.round(ms / 60_000);
  if (totalMins < 1) return t(`${i18nPrefix}.lessThanOneMin`);
  return formatHours(ms / 3_600_000);
}

export function formatTime(isoString) {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatSessionLabel(isoString, t, i18nPrefix) {
  const d = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return t(`${i18nPrefix}.today`);
  if (d.toDateString() === yesterday.toDateString()) return t(`${i18nPrefix}.yesterday`);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function toDatetimeLocal(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function computeTodayPeriods(events, now) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return events
    .filter((e) => {
      const from = new Date(e.startedAt);
      const to = e.endedAt ? new Date(e.endedAt) : now;
      return to > todayStart && from < todayEnd;
    })
    .map((e) => {
      const fromDate = new Date(e.startedAt);
      const toDate = e.endedAt ? new Date(e.endedAt) : now;
      const fromH = fromDate < todayStart ? 0 : fromDate.getHours() + fromDate.getMinutes() / 60;
      const toH = toDate >= todayEnd ? 24 : toDate.getHours() + toDate.getMinutes() / 60;
      const durationH = toH - fromH;
      const tooltip = `${formatTime(e.startedAt)} – ${e.endedAt ? formatTime(e.endedAt) : '…'} · ${formatHours(durationH)}`;
      return { fromH, toH, tooltip };
    });
}

export function computeGapPeriods(primaryPeriods, now) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const nowH = (now.getTime() - todayStart.getTime()) / 3_600_000;

  const sorted = [...primaryPeriods].sort((a, b) => a.fromH - b.fromH);
  const gaps = [];
  let cursor = 0;

  for (const { fromH, toH } of sorted) {
    if (cursor < fromH) gaps.push({ fromH: cursor, toH: fromH });
    cursor = Math.max(cursor, toH);
  }
  if (cursor < nowH) gaps.push({ fromH: cursor, toH: nowH });

  return gaps;
}

/**
 * Compute event periods for an arbitrary calendar date (0–24h range).
 * Active events (no endedAt) are capped at midnight of that day.
 */
/**
 * Total hours of matching events on a given calendar date.
 * Active events (no endedAt) are capped at `now`, not at midnight,
 * so an in-progress session contributes its elapsed portion to the total.
 */
export function computeDayDuration(events, date, now = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return events.reduce((total, e) => {
    const from = new Date(e.startedAt).getTime();
    const to = e.endedAt
      ? new Date(e.endedAt).getTime()
      : Math.min(now.getTime(), dayEnd.getTime()); // cap active events at now (or midnight for past days)
    const clampedFrom = Math.max(from, dayStart.getTime());
    const clampedTo = Math.min(to, dayEnd.getTime());
    return clampedTo > clampedFrom ? total + (clampedTo - clampedFrom) / 3_600_000 : total;
  }, 0);
}

export function computePeriodsForDate(events, date, now = new Date()) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  // Cap active events at now (or midnight for past days) — same logic as computeDayDuration
  const cap = (e) =>
    e.endedAt
      ? new Date(e.endedAt)
      : new Date(Math.min(now.getTime(), dayEnd.getTime()));

  return events
    .filter((e) => {
      const to = cap(e);
      return to > dayStart && new Date(e.startedAt) < dayEnd;
    })
    .map((e) => {
      const fromDate = new Date(e.startedAt);
      const toDate = cap(e);
      const fromH = fromDate < dayStart ? 0 : fromDate.getHours() + fromDate.getMinutes() / 60;
      const toH = toDate >= dayEnd ? 24 : toDate.getHours() + toDate.getMinutes() / 60;
      const durationH = toH - fromH;
      const tooltip = `${formatTime(e.startedAt)} – ${e.endedAt ? formatTime(e.endedAt) : '…'} · ${formatHours(durationH)}`;
      return { fromH, toH, tooltip };
    });
}

export function computeWeeklyHistory(events, days = 7) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (days - 1 - i));
    return computeDayDuration(events, day, now);
  });
}
