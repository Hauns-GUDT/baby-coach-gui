import { axiosClient } from './axiosClient';

export async function getEvents(babyId, { types, ...rest } = {}) {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(rest)) {
    if (v !== undefined && v !== null) searchParams.set(k, String(v));
  }
  if (types?.length) {
    types.forEach((t) => searchParams.append('types', t));
  }
  const { data } = await axiosClient.get(`/babies/${babyId}/events`, { params: searchParams });
  return data;
}

/**
 * Fetches all events across all pages for non-paginated use cases.
 * Keeps requesting pages until the full result set is retrieved.
 */
export async function getAllEvents(babyId, params = {}) {
  const PAGE_SIZE = 100;
  let page = 1;
  const collected = [];

  while (true) {
    const res = await getEvents(babyId, { ...params, page, limit: PAGE_SIZE });
    const items = Array.isArray(res) ? res : (res.data ?? []);
    collected.push(...items);
    const total = res.total ?? collected.length;
    if (items.length < PAGE_SIZE || collected.length >= total) break;
    page++;
  }

  return collected;
}

export async function startEvent(babyId, type, notes) {
  const { data } = await axiosClient.post(`/babies/${babyId}/events/start`, { type, ...(notes !== undefined && { notes }) });
  return data;
}

export async function createEvent(babyId, payload) {
  const { data } = await axiosClient.post(`/babies/${babyId}/events`, payload);
  return data;
}

export async function updateEvent(babyId, eventId, payload) {
  const { data } = await axiosClient.patch(`/babies/${babyId}/events/${eventId}`, payload);
  return data;
}

export async function stopEvent(babyId, eventId) {
  const { data } = await axiosClient.post(`/babies/${babyId}/events/${eventId}/stop`);
  return data;
}

export async function deleteEvent(babyId, eventId) {
  await axiosClient.delete(`/babies/${babyId}/events/${eventId}`);
}
