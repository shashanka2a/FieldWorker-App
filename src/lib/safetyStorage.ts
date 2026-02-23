export type SafetyTalkStatus = 'upcoming' | 'missed' | 'conducted';

export interface SafetyTalk {
  id: string;
  templateId: string;
  templateName: string;
  /** ISO date-only string: YYYY-MM-DD */
  date: string;
  status: SafetyTalkStatus;
  createdAt: string;
}

const STORAGE_KEY = 'safety_talks';

function readTalks(): SafetyTalk[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTalks(talks: SafetyTalk[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(talks));
}

export function getSafetyTalks(): SafetyTalk[] {
  return readTalks();
}

export function getTalkById(id: string): SafetyTalk | undefined {
  return readTalks().find((t) => t.id === id);
}

export function addScheduledSafetyTalk(dateKey: string, templateId: string, templateName: string): void {
  const talks = readTalks();
  const talk: SafetyTalk = {
    id: Date.now().toString(),
    templateId,
    templateName,
    date: dateKey,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  };
  talks.push(talk);
  writeTalks(talks);
}

export function updateScheduledSafetyTalk(id: string, dateKey: string, templateId: string, templateName: string): void {
  const talks = readTalks();
  const idx = talks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  talks[idx] = { ...talks[idx], date: dateKey, templateId, templateName };
  writeTalks(talks);
}

export function deleteScheduledSafetyTalk(id: string): void {
  const talks = readTalks().filter((t) => t.id !== id);
  writeTalks(talks);
}

