import { getCollection } from 'astro:content';

export const SERIES_TITLE = 'Database internals';
export const SERIES_PATH = 'writing/db-internals/';

// Notes in reading order. Drafts are included in dev unless includeDrafts is false.
export async function getNotes({ includeDrafts = import.meta.env.DEV } = {}) {
  const notes = await getCollection('db-internals', ({ data }) => includeDrafts || !data.draft);
  return notes.sort((a, b) => a.data.part - b.data.part);
}

export const formatPart = (part: number) => `Note ${String(part).padStart(2, '0')}`;

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
