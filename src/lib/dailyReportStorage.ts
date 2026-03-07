/**
 * Daily report storage: persist and read all submissions by date (YYYY-MM-DD).
 * Keys: notes_YYYY-MM-DD, chemicals_YYYY-MM-DD, metrics_YYYY-MM-DD,
 * survey_YYYY-MM-DD, equipment_YYYY-MM-DD, attachments_YYYY-MM-DD,
 * report_signed_YYYY-MM-DD, selectedDate (ISO string).
 */

/** Date key as YYYY-MM-DD in local time so save and report always use the same key. */
export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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
  applicationType?: 'wicking' | 'spraying';
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
  greenSpaceCompleted?: string;
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

export interface IncidentEntry {
  id: string;
  project: { name: string };
  timestamp: string;
  title: string;
  status: 'open' | 'closed';
  recordable: boolean;
  incidentDate: string;
  incidentTime: string;
  location: string;
  injuryType: string;
  employeeInfo: string;
  investigation: string;
  outcome: string;
  photos?: string[];
}

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
  incidents: (d: string) => `incidents_${d}`,
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

export function saveIncident(dateKey: string, entry: IncidentEntry): void {
  appendEntry(STORAGE_KEYS.incidents, dateKey, entry);
}

export function getIncidents(dateKey: string): IncidentEntry[] {
  return readArray<IncidentEntry>(STORAGE_KEYS.incidents(dateKey));
}

export function updateIncident(dateKey: string, updatedEntry: IncidentEntry): void {
  const key = STORAGE_KEYS.incidents(dateKey);
  const arr = readArray<IncidentEntry>(key);
  const idx = arr.findIndex(e => e.id === updatedEntry.id);
  if (idx !== -1) {
    arr[idx] = updatedEntry;
    writeArray(key, arr);
  }
}

export function saveEquipmentChecklist(dateKey: string, entry: EquipmentChecklistEntry): void {
  appendEntry(STORAGE_KEYS.equipment, dateKey, entry as unknown as EquipmentEntry);
}

const SIGNED_REPORT_DATE_KEYS = "signed_report_date_keys";

export function saveSignedReport(dateKey: string, entry: SignedReportEntry): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.signed(dateKey), JSON.stringify(entry));
  const keys = getSignedReportDateKeys();
  if (!keys.includes(dateKey)) {
    keys.push(dateKey);
    keys.sort().reverse();
    localStorage.setItem(SIGNED_REPORT_DATE_KEYS, JSON.stringify(keys));
  }
}

const REPORT_SIGNED_PREFIX = "report_signed_";

export function getSignedReportDateKeys(): string[] {
  if (typeof window === "undefined") return [];
  const fromList: string[] = [];
  try {
    const raw = localStorage.getItem(SIGNED_REPORT_DATE_KEYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) fromList.push(...parsed);
    }
  } catch {
    // ignore
  }
  const discovered: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(REPORT_SIGNED_PREFIX)) {
        const dateKey = key.slice(REPORT_SIGNED_PREFIX.length);
        if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && !fromList.includes(dateKey))
          discovered.push(dateKey);
      }
    }
  } catch {
    // ignore
  }
  const merged = [...new Set([...fromList, ...discovered])].sort().reverse();
  if (discovered.length > 0) {
    localStorage.setItem(SIGNED_REPORT_DATE_KEYS, JSON.stringify(merged));
  }
  return merged;
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
  incidents: IncidentEntry[];
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
    incidents: readArray<IncidentEntry>(STORAGE_KEYS.incidents(dateKey)),
    signed: getSignedReport(dateKey),
  };
}

// --- Aggregate helpers for Day / Week / To-Date tracking ---

export interface MetricsAggregate {
  waterUsage: number;
  acresCompleted: number;
  greenSpaceCompleted: number;
  numberOfOperators: number;
}

/** name → { unit, quantity } */
export interface ChemicalAggregate {
  [name: string]: { unit: string; quantity: number };
}

function sumMetricsForDates(dates: Date[]): MetricsAggregate {
  const agg: MetricsAggregate = { waterUsage: 0, acresCompleted: 0, greenSpaceCompleted: 0, numberOfOperators: 0 };
  for (const d of dates) {
    const entries = readArray<MetricsEntry>(STORAGE_KEYS.metrics(getDateKey(d)));
    for (const e of entries) {
      agg.waterUsage += parseFloat(e.waterUsage || "0") || 0;
      agg.acresCompleted += parseFloat(e.acresCompleted || "0") || 0;
      agg.greenSpaceCompleted += parseFloat(e.greenSpaceCompleted || "0") || 0;
      agg.numberOfOperators += parseFloat(e.numberOfOperators || "0") || 0;
    }
  }
  return agg;
}

function sumChemicalsForDates(dates: Date[]): ChemicalAggregate {
  const agg: ChemicalAggregate = {};
  for (const d of dates) {
    const entries = readArray<ChemicalEntry>(STORAGE_KEYS.chemicals(getDateKey(d)));
    for (const e of entries) {
      for (const ch of e.chemicals) {
        const qty = parseFloat(ch.quantity || "0") || 0;
        if (qty === 0) continue;
        if (!agg[ch.name]) {
          agg[ch.name] = { unit: ch.unit, quantity: 0 };
        }
        agg[ch.name].quantity += qty;
      }
    }
  }
  return agg;
}

/** Get the Monday of the week containing `date` */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Build a date array from `start` to `end` (inclusive) */
function dateRange(start: Date, end: Date): Date[] {
  const result: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endNorm = new Date(end);
  endNorm.setHours(0, 0, 0, 0);
  while (cur <= endNorm) {
    result.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export interface ProgressTotals {
  dayMetrics: MetricsAggregate;
  weekMetrics: MetricsAggregate;
  toDateMetrics: MetricsAggregate;
  dayChemicals: ChemicalAggregate;
  weekChemicals: ChemicalAggregate;
  toDateChemicals: ChemicalAggregate;
}

/**
 * Compute Day / Week / To-Date progress for a given report date.
 * "To Date" uses all data from the past 365 days up to `date`.
 */
export function getProgressTotals(date: Date): ProgressTotals {
  const dayDates = [date];

  const weekStart = getWeekStart(date);
  const weekDates = dateRange(weekStart, date);

  // "To Date" — scan 365 days back
  const toDateStart = new Date(date);
  toDateStart.setDate(toDateStart.getDate() - 365);
  const toDateDates = dateRange(toDateStart, date);

  return {
    dayMetrics: sumMetricsForDates(dayDates),
    weekMetrics: sumMetricsForDates(weekDates),
    toDateMetrics: sumMetricsForDates(toDateDates),
    dayChemicals: sumChemicalsForDates(dayDates),
    weekChemicals: sumChemicalsForDates(weekDates),
    toDateChemicals: sumChemicalsForDates(toDateDates),
  };
}
