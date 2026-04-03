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

export async function createEvent(babyId, payload) {
  const { data } = await axiosClient.post(`/babies/${babyId}/events`, payload);
  return data;
}

export async function updateEvent(babyId, eventId, payload) {
  const { data } = await axiosClient.patch(`/babies/${babyId}/events/${eventId}`, payload);
  return data;
}

export async function deleteEvent(babyId, eventId) {
  await axiosClient.delete(`/babies/${babyId}/events/${eventId}`);
}
