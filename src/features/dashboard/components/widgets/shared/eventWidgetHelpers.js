// ─── Chart.js doughnut helpers ────────────────────────────────────────────────

/**
 * Build Chart.js doughnut segments for a 12-hour clock face.
 * Primary and secondary periods are expected to be in [0, 12] hour range
 * (i.e. already split via clockSplitPeriods).
 */
export function buildDoughnutSegments(primaryPeriods, primaryColor, secondaryPeriods = [], secondaryColor = null) {
  const maxH = 12;

  const allSegs = [
    ...primaryPeriods.map((p) => ({ from: p.fromH, to: p.toH, color: primaryColor, kind: 'primary' })),
    ...(secondaryColor ? secondaryPeriods.map((p) => ({ from: p.fromH, to: p.toH, color: secondaryColor, kind: 'secondary' })) : []),
  ].sort((a, b) => a.from - b.from);

  const data = [];
  const colors = [];
  const meta = [];
  let cursor = 0;

  for (const seg of allSegs) {
    const from = Math.max(seg.from, cursor);
    const to = Math.min(seg.to, maxH);
    if (to <= from) continue;

    if (from > cursor) {
      data.push(from - cursor);
      colors.push('#e4e4e7');
      meta.push({ kind: 'inactive', fromH: cursor, toH: from });
    }
    data.push(to - from);
    colors.push(seg.color);
    meta.push({ kind: seg.kind, fromH: from, toH: to });
    cursor = to;
    if (cursor >= maxH) break;
  }

  if (cursor < maxH) {
    data.push(maxH - cursor);
    colors.push('#e4e4e7');
    meta.push({ kind: 'inactive', fromH: cursor, toH: maxH });
  }

  if (data.length === 0) {
    data.push(maxH);
    colors.push('#e4e4e7');
    meta.push({ kind: 'inactive', fromH: 0, toH: maxH });
  }

  return { data, colors, meta };
}

export function hoursToTimeStr(h) {
  const totalMins = Math.round(h * 60);
  const hh = Math.floor(totalMins / 60) % 24;
  const mm = totalMins % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

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
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      return { fromH, toH };
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
export function computePeriodsForDate(events, date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return events
    .filter((e) => {
      const from = new Date(e.startedAt);
      const to = e.endedAt ? new Date(e.endedAt) : dayEnd;
      return to > dayStart && from < dayEnd;
    })
    .map((e) => {
      const fromDate = new Date(e.startedAt);
      const toDate = e.endedAt ? new Date(e.endedAt) : dayEnd;
      const fromH = fromDate < dayStart ? 0 : fromDate.getHours() + fromDate.getMinutes() / 60;
      const toH = toDate >= dayEnd ? 24 : toDate.getHours() + toDate.getMinutes() / 60;
      return { fromH, toH };
    });
}

export function computeWeeklyHistory(events) {
  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() - (6 - i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    return events
      .filter((e) => e.endedAt)
      .reduce((total, e) => {
        const from = new Date(e.startedAt).getTime();
        const to = new Date(e.endedAt).getTime();
        const clampedFrom = Math.max(from, dayStart.getTime());
        const clampedTo = Math.min(to, dayEnd.getTime());
        return clampedTo > clampedFrom ? total + (clampedTo - clampedFrom) / 3_600_000 : total;
      }, 0);
  });
}
