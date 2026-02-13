/**
 * Daily report storage: persist and read all submissions by date (YYYY-MM-DD).
 * Keys: notes_YYYY-MM-DD, chemicals_YYYY-MM-DD, metrics_YYYY-MM-DD,
 * survey_YYYY-MM-DD, equipment_YYYY-MM-DD, attachments_YYYY-MM-DD,
 * report_signed_YYYY-MM-DD, selectedDate (ISO string).
 */

export function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getReportDate(): Date {
  if (typeof window === "undefined") return new Date();
  const saved = localStorage.getItem("selectedDate");
  if (saved) return new Date(saved);
  return new Date();
}

/** Formatted for UI: "Wed, Feb 12, 2026" (always the actual date for consistency) */
export function formatReportDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// --- Entry types (match form payloads) ---

export interface NoteEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  category: string;
  notes: string;
  photos?: string[];
}

export interface ChemicalEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  chemicals: { name: string; quantity: string; unit: string }[];
  notes?: string;
  photos?: string[];
}

export interface MetricsEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  waterUsage?: string;
  acresCompleted?: string;
  numberOfOperators?: string;
  notes?: string;
  photos?: string[];
}

export interface SurveyQuestionEntry {
  id: number;
  question: string;
  answer: "N/A" | "No" | "Yes" | "";
  description: string;
}

export interface SurveyEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  questions: SurveyQuestionEntry[];
}

export interface EquipmentEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  value?: string;
  unit?: string;
  notes?: string;
  photos?: string[];
}

export interface MaterialEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  value: string;
  unit: string;
  notes?: string;
  photos?: string[];
}

export interface AttachmentEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  fileNames: string[];
  notes?: string;
  /** Data URLs or blob URLs for images; for non-images we store name only */
  previews?: string[];
}

export interface EquipmentChecklistEntry {
  id: string;
  type: "checklist";
  timestamp: string;
  formData: Record<string, string>;
  signature?: string;
  photos?: string[];
}

export type EquipmentOrChecklistEntry = EquipmentEntry | EquipmentChecklistEntry;

export interface SignedReportEntry {
  signedAt: string;
  preparedBy: string;
  signatureDataUrl: string;
  projectName: string;
}

// --- Storage helpers ---

const STORAGE_KEYS = {
  notes: (d: string) => `notes_${d}`,
  chemicals: (d: string) => `chemicals_${d}`,
  metrics: (d: string) => `metrics_${d}`,
  survey: (d: string) => `survey_${d}`,
  equipment: (d: string) => `equipment_${d}`,
  material: (d: string) => `material_${d}`,
  attachments: (d: string) => `attachments_${d}`,
  signed: (d: string) => `report_signed_${d}`,
} as const;

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function appendEntry<T>(keyFn: (d: string) => string, dateKey: string, entry: T): void {
  const key = keyFn(dateKey);
  const arr = readArray<T>(key);
  arr.push(entry);
  writeArray(key, arr);
}

export function saveNotes(dateKey: string, entry: NoteEntry): void {
  appendEntry(STORAGE_KEYS.notes, dateKey, entry);
}

export function saveChemicals(dateKey: string, entry: ChemicalEntry): void {
  appendEntry(STORAGE_KEYS.chemicals, dateKey, entry);
}

export function saveMetrics(dateKey: string, entry: MetricsEntry): void {
  appendEntry(STORAGE_KEYS.metrics, dateKey, entry);
}

export function saveSurvey(dateKey: string, entry: SurveyEntry): void {
  appendEntry(STORAGE_KEYS.survey, dateKey, entry);
}

export function saveEquipment(dateKey: string, entry: EquipmentEntry): void {
  appendEntry(STORAGE_KEYS.equipment, dateKey, entry);
}

export function saveMaterial(dateKey: string, entry: MaterialEntry): void {
  appendEntry(STORAGE_KEYS.material, dateKey, entry);
}

export function saveAttachments(dateKey: string, entry: AttachmentEntry): void {
  appendEntry(STORAGE_KEYS.attachments, dateKey, entry);
}

export function saveEquipmentChecklist(dateKey: string, entry: EquipmentChecklistEntry): void {
  appendEntry(STORAGE_KEYS.equipment, dateKey, entry as unknown as EquipmentEntry);
}

export function saveSignedReport(dateKey: string, entry: SignedReportEntry): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.signed(dateKey), JSON.stringify(entry));
}

export function getSignedReport(dateKey: string): SignedReportEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.signed(dateKey));
    if (!raw) return null;
    return JSON.parse(raw) as SignedReportEntry;
  } catch {
    return null;
  }
}

// --- Aggregated report for a date ---

export interface ReportData {
  dateKey: string;
  date: Date;
  projectName: string;
  notes: NoteEntry[];
  chemicals: ChemicalEntry[];
  material: MaterialEntry[];
  metrics: MetricsEntry[];
  survey: SurveyEntry[];
  equipment: EquipmentOrChecklistEntry[];
  attachments: AttachmentEntry[];
  signed: SignedReportEntry | null;
}

export function getReportForDate(date: Date, projectName: string = "North Valley Solar Farm"): ReportData {
  const dateKey = getDateKey(date);
  return {
    dateKey,
    date,
    projectName,
    notes: readArray<NoteEntry>(STORAGE_KEYS.notes(dateKey)),
    chemicals: readArray<ChemicalEntry>(STORAGE_KEYS.chemicals(dateKey)),
    material: readArray<MaterialEntry>(STORAGE_KEYS.material(dateKey)),
    metrics: readArray<MetricsEntry>(STORAGE_KEYS.metrics(dateKey)),
    survey: readArray<SurveyEntry>(STORAGE_KEYS.survey(dateKey)),
    equipment: readArray<EquipmentOrChecklistEntry>(STORAGE_KEYS.equipment(dateKey)),
    attachments: readArray<AttachmentEntry>(STORAGE_KEYS.attachments(dateKey)),
    signed: getSignedReport(dateKey),
  };
}
