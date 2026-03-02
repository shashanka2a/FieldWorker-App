# FieldWorker App — Complete App Flow & Architecture Guide

> Generated: 2026-02-25 | Stack: Next.js 15 (App Router) + TypeScript + TailwindCSS v4 + Radix UI

---

## 1. Tech Stack Overview

| Layer | Technology |
|-------|-----------|
| Framework | **Next.js 15** (App Router, `"use client"` components) |
| Language | **TypeScript 5.7** |
| Styling | **TailwindCSS v4** (inline utility classes) |
| UI Primitives | **Radix UI** + **shadcn/ui** components |
| Icons | **Lucide React** |
| Forms | **React Hook Form** (available, not used in all forms) |
| State | **React `useState` / `useEffect`** (no global state manager) |
| Persistence | **`localStorage`** (all data is client-side only — NO backend) |
| Routing | Next.js file-system routing (`/app` directory) |
| PWA | Manifest + theme color (`#FF6633`), mobile-first |

---

## 2. Directory Structure

```
/
├── app/                          # Next.js App Router (pages)
│   ├── layout.tsx                # Root layout (fonts, metadata, viewport)
│   ├── page.tsx                  # / → renders <Home />
│   ├── globals.css               # CSS variables, animations, base styles
│   ├── activity/page.tsx         # /activity → <ActivityHistory />
│   ├── attachments-list/page.tsx # /attachments-list → <AttachmentsList />
│   ├── checklist/page.tsx        # /checklist → <DailyChecklist />
│   ├── gallery/page.tsx          # /gallery → <Gallery />
│   ├── material-log/page.tsx     # /material-log → <MaterialLog />
│   ├── more/page.tsx             # /more → <More />
│   ├── notes-list/page.tsx       # /notes-list → <NotesList />
│   ├── projects/page.tsx         # /projects → <Projects />
│   ├── reports/page.tsx          # /reports → <Reports /> (signed report history)
│   ├── settings/page.tsx         # /settings → <Settings />
│   ├── report/
│   │   ├── preview/page.tsx      # /report/preview?date=YYYY-MM-DD → Report viewer
│   │   └── sign/page.tsx         # /report/sign → Signature capture
│   ├── safety/
│   │   ├── page.tsx              # /safety → <SafetyList />
│   │   ├── read/page.tsx         # /safety/read?template=X&mode=start → PDF reader
│   │   ├── schedule/page.tsx     # /safety/schedule?id=X → <SafetyScheduleForm />
│   │   ├── template/page.tsx     # /safety/template?mode=start|schedule → picker
│   │   └── signatures/
│   │       ├── page.tsx          # /safety/signatures → choice: digital|photo
│   │       ├── digital/page.tsx  # /safety/signatures/digital
│   │       └── photo/page.tsx    # /safety/signatures/photo
│   └── submit/
│       ├── [type]/page.tsx       # /submit/material | /submit/equipment
│       ├── attachments/page.tsx  # /submit/attachments → <SubmitAttachments />
│       ├── metrics/page.tsx      # /submit/metrics → <DailyMetrics />
│       ├── notes/page.tsx        # /submit/notes → <Notes />
│       └── survey/page.tsx       # /submit/survey → <Survey />
│
├── src/
│   ├── components/               # All React page components
│   │   ├── Home.tsx              # Dashboard / Daily Logs
│   │   ├── BottomNav.tsx         # Persistent bottom navigation (3 tabs)
│   │   ├── Notes.tsx             # Notes entry form
│   │   ├── NotesList.tsx         # Notes history/list
│   │   ├── MaterialLog.tsx       # Chemicals left log form
│   │   ├── DailyMetrics.tsx      # Water/Acres/Operators metrics form
│   │   ├── Survey.tsx            # 9-question site survey form
│   │   ├── DailyChecklist.tsx    # Equipment inspection checklist + signature
│   │   ├── SubmitAttachments.tsx # File/photo uploads
│   │   ├── SubmitForm.tsx        # Generic form for material/equipment types
│   │   ├── SafetyList.tsx        # Safety talks list (upcoming/missed/done)
│   │   ├── SafetyScheduleForm.tsx# Schedule a safety talk (calendar picker)
│   │   ├── SafetyTemplatePicker.tsx # Pick safety talk template
│   │   ├── SafetyTalkReader.tsx  # PDF viewer for safety talk
│   │   ├── SafetySignaturesDigital.tsx # Digital signature for safety talk
│   │   ├── SafetySignaturesPhoto.tsx   # Photo signature for safety talk
│   │   ├── ActivityHistory.tsx   # Activity log feed
│   │   ├── AttachmentsList.tsx   # Gallery of uploaded attachments
│   │   ├── Gallery.tsx           # Full photo gallery
│   │   ├── More.tsx              # User profile + navigation menu
│   │   ├── ReportPreview.tsx     # Printable daily report renderer
│   │   ├── Reports.tsx           # Signed reports history list
│   │   ├── Profile.tsx           # Profile settings
│   │   ├── Projects.tsx          # Project list
│   │   ├── Settings.tsx          # App settings
│   │   ├── GetSignatures.tsx     # Report signature capture
│   │   └── ui/                   # shadcn/ui primitives (49 components)
│   └── lib/
│       ├── dailyReportStorage.ts # All report data: read/write localStorage
│       ├── safetyStorage.ts      # Safety talks CRUD: localStorage
│       └── safetyTemplates.ts    # Static array of 3 safety talk templates
```

---

## 3. App Navigation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BOTTOM NAVIGATION                        │
│   [Home /]          [Activity /activity]      [More /more]  │
└────────┬───────────────────┬──────────────────────┬─────────┘
         │                   │                      │
         ▼                   ▼                      ▼
   ┌──────────┐       ┌────────────┐        ┌──────────────┐
   │  Home    │       │  Activity  │        │    More      │
   │ Dashboard│       │  Feed      │        │  Menu        │
   └────┬─────┘       └────────────┘        └──────┬───────┘
        │                                          │
        │ 8 Task Tiles                             ├─► /reports
        │                                          ├─► /gallery
        ├──► /notes-list → /submit/notes           ├─► /projects
        ├──► /material-log (Chemicals)             └─► /settings
        ├──► /submit/metrics
        ├──► /submit/survey
        ├──► /checklist (Equipment)
        ├──► /attachments-list → /submit/attachments
        ├──► /safety → /safety/template → /safety/read
        │              → /safety/schedule          → /safety/signatures/digital
        │              → /safety/signatures        → /safety/signatures/photo
        └──► /report/preview → /report/sign
```

---

## 4. Screen-by-Screen Flow

### 4.1 Home Dashboard (`/`)
- **Component:** `Home.tsx`
- **Purpose:** Central hub for daily field reporting
- **State:** `selectedProject` (3 hardcoded projects), `selectedDate` (synced with localStorage)
- **Key Features:**
  - Project selector dropdown (backdrop overlay)
  - Horizontal scrollable weekday strip (7 past + selected + 6 future)
  - Full-month calendar modal (toggle) with day status indicators:
    - 🟢 Green dot = signed report
    - 🟡 Yellow bar = data logged, unsigned
    - 🔴 Red triangle = no data logged (missed)
  - 3×3 grid of task tiles (tap → navigate with loading spinner)
  - Hidden file input for quick attachment upload

### 4.2 Notes (`/notes-list` → `/submit/notes`)
- **NotesList.tsx**: Shows all saved notes for the selected date; each note card links back
- **Notes.tsx**: Form with project (read-only), category picker (5 options), freetext textarea, multi-photo (camera/upload)
- **Save:** `saveNotes(dateKey, entry)` → `localStorage["notes_YYYY-MM-DD"]`

### 4.3 Chemicals / Material Log (`/material-log`)
- **Component:** `MaterialLog.tsx`
- **Purpose:** Log remaining chemicals (quantities left on truck)
- **Pre-populated list:** 6 default chemicals (Glyphosate, Surfactant, Super Dye, 2,4-D, Ecomazapyr 2SL, Regular Dye)
- **Validation:** Quantity threshold warnings (>100 GAL Glyphosate, >128 oz Surfactant)
- **Custom chemicals:** Add/remove beyond the 6 defaults
- **Save:** `saveChemicals(dateKey, entry)` → `localStorage["chemicals_YYYY-MM-DD"]`

### 4.4 Metrics (`/submit/metrics`)
- **Component:** `DailyMetrics.tsx`
- **Fields:** Water Usage (GAL), Acres Completed, Number of Operators, Notes, Photos
- **Save:** `saveMetrics(dateKey, entry)` → `localStorage["metrics_YYYY-MM-DD"]`

### 4.5 Survey (`/submit/survey`)
- **Component:** `Survey.tsx`
- **Purpose:** 9-question site survey (equipment malfunctions, accidents, weather delays, etc.)
- **Answer options:** N/A / No / Yes (color-coded); optional description per question
- **Save:** `saveSurvey(dateKey, entry)` → `localStorage["survey_YYYY-MM-DD"]`

### 4.6 Equipment Checklist (`/checklist`)
- **Component:** `DailyChecklist.tsx`
- **Fields:** Machine #, Last 4 VIN, Operator Name, Date/Time (auto), Site Name (dropdown), ASV Hours
- **Fluid Levels:** Motor Oil, Coolant, Hydraulic Oil (FULL/LOW toggles, amount if LOW)
- **Equipment Condition:** Hoses (GOOD/BAD), Fan Belt (TIGHT/LOOSE), Attachment (optional)
- **Repairs & Issues:** Freetext + camera photos
- **Operator Signature:** Canvas draw pad → saves as data URL
- **Save:** `saveEquipmentChecklist(dateKey, entry)` → `localStorage["equipment_YYYY-MM-DD"]`

### 4.7 Attachments (`/attachments-list` → `/submit/attachments`)
- **AttachmentsList.tsx**: List of saved file attachments per date
- **SubmitAttachments.tsx**: File picker (images + PDF + .doc) with preview grid
- **Save:** `saveAttachments(dateKey, entry)` → `localStorage["attachments_YYYY-MM-DD"]`

### 4.8 Safety Talks (`/safety`)
- **Entry Point:** `SafetyList.tsx` — 3-tab view (Upcoming / Missed / Done) with search
- **FAB (+) → Action Sheet:**
  - **"Start Talk Now"** → `/safety/template?mode=start` → Pick template → `/safety/read` → PDF viewer → `/safety/signatures` → digital or photo signature
  - **"Schedule a Talk"** → `/safety/template?mode=schedule` → Pick template → `/safety/schedule` → calendar date picker → save
- **Edit existing:** Tap Upcoming/Missed card → `/safety/schedule?id=X` (edit/reschedule/delete)
- **Completed:** Tap Done card → re-read the PDF
- **Templates (static):** AED Safety Talk, Slips Trips & Falls, PPE
- **Save:** `addScheduledSafetyTalk()` / `updateScheduledSafetyTalk()` / `deleteScheduledSafetyTalk()` → `localStorage["safety_talks"]`

### 4.9 Daily Report (`/report/preview`, `/report/sign`)
- **ReportPreview.tsx**: Printable report document (white paper on grey bg)
  - Sections: Date/Job header, Weather (placeholder —), General Notes, Daily Metrics, Chemicals Left, Equipment Checklist, Site Photos (aggregated from all entries), Survey table, Signature block
- **Signing:** `/report/sign` → full-name input + canvas signature → `saveSignedReport(dateKey, entry)` → `localStorage["report_signed_YYYY-MM-DD"]`
- **After signing:** Calendar shows green dot; report becomes read-only

### 4.10 Activity (`/activity`)
- **Component:** `ActivityHistory.tsx`
- **Status:** UI shell only — `activities` array is always empty (no data loading implemented yet)
- **Filters:** All / Today / This Week

### 4.11 More (`/more`)
- **Component:** `More.tsx`
- **User:** Hardcoded (Ricky Smith, Field Supervisor)
- **Links:** Reports, Gallery, Projects, Settings
- **Sign Out:** Stub (console.log only)

---

## 5. Data Model (localStorage Keys)

All data is keyed by `YYYY-MM-DD` date strings.

```typescript
// Per-day keys:
"notes_YYYY-MM-DD"        → NoteEntry[]
"chemicals_YYYY-MM-DD"    → ChemicalEntry[]
"metrics_YYYY-MM-DD"      → MetricsEntry[]
"survey_YYYY-MM-DD"       → SurveyEntry[]
"equipment_YYYY-MM-DD"    → (EquipmentEntry | EquipmentChecklistEntry)[]
"material_YYYY-MM-DD"     → MaterialEntry[]
"attachments_YYYY-MM-DD"  → AttachmentEntry[]
"report_signed_YYYY-MM-DD"→ SignedReportEntry (object, not array)

// Global keys:
"selectedDate"            → ISO date string (selected reporting date)
"safety_talks"            → SafetyTalk[]
"signed_report_date_keys" → string[] (list of dates with signed reports)
```

### Key Data Types
```typescript
interface NoteEntry      { id, project, timestamp, category, notes, photos? }
interface ChemicalEntry  { id, project, timestamp, chemicals[{name,qty,unit}], notes?, photos? }
interface MetricsEntry   { id, project, timestamp, waterUsage?, acresCompleted?, numberOfOperators?, notes?, photos? }
interface SurveyEntry    { id, project, timestamp, questions[{id,question,answer,description}] }
interface EquipmentChecklistEntry { id, type:"checklist", timestamp, formData{...}, signature?, photos? }
interface AttachmentEntry{ id, project, timestamp, fileNames[], notes?, previews? }
interface SignedReportEntry { signedAt, preparedBy, signatureDataUrl, projectName }
interface SafetyTalk     { id, templateId, templateName, date(YYYY-MM-DD), status, createdAt }
```

---

## 6. Color System

| Color | Hex | Usage |
|-------|-----|-------|
| Brand Orange | `#FF6633` | Primary actions, project card, icons, submit buttons |
| iOS Blue | `#0A84FF` | Navigation, selected dates, secondary links |
| Surface Dark | `#1C1C1E` | App background |
| Card Dark | `#2C2C2E` | Cards, inputs, headers |
| Border | `#3A3A3C` | All borders |
| Subtitle | `#98989D` | Muted labels |
| Success Green | `#30D158` | Signed status, success indicators |
| Warning Yellow | `#FFD60A` | Unsigned/missed indicators |
| Danger Red | `#FF453A` | Delete, error states |
| Amber | `#FF9F0A` | Warning banner, equipment color |

---

## 7. Known Gaps & Missing Features

1. **No authentication** — user is hardcoded as "Ricky Smith"
2. **No backend/API** — all data in `localStorage` (lost on browser clear/different device)
3. **Activity feed is empty** — `ActivityHistory.tsx` has no data loading logic
4. **Projects are hardcoded** — 3 static projects, no CRUD
5. **Weather is static** — Report shows `—°` placeholders
6. **Material vs Chemicals confusion** — "material-log" route uses `MaterialLog.tsx` which saves `saveChemicals()` not `saveMaterial()`; `/submit/[type]` route handles its own material/equipment saves
7. **Safety talk signatures** — `SafetySignaturesDigital.tsx` and `SafetySignaturesPhoto.tsx` are minimal shells
8. **PDF rendering** — `SafetyTalkReader.tsx` uses an `<iframe>` for PDF display; no native PDF rendering
9. **Settings page** — `Settings.tsx` is a stub
10. **Sign out** — `More.tsx` sign out logs to console only

---

## 8. Suggested API / Backend Migration

### 8.1 API Layer Design

Replace `localStorage` calls in `src/lib/` with `fetch()` calls to a REST or tRPC API. The suggested pattern:

```
src/lib/api/
├── client.ts           # Base fetch wrapper (auth headers, error handling)
├── reports.ts          # GET/POST daily report entries
├── safety.ts           # GET/POST/PUT/DELETE safety talks
├── projects.ts         # GET projects list
└── users.ts            # GET current user
```

### 8.2 Endpoint Mapping

| Current localStorage call | Suggested REST Endpoint |
|--------------------------|------------------------|
| `saveNotes(dateKey, entry)` | `POST /api/reports/{date}/notes` |
| `saveChemicals(dateKey, entry)` | `POST /api/reports/{date}/chemicals` |
| `saveMetrics(dateKey, entry)` | `POST /api/reports/{date}/metrics` |
| `saveSurvey(dateKey, entry)` | `POST /api/reports/{date}/survey` |
| `saveEquipmentChecklist(dateKey, entry)` | `POST /api/reports/{date}/equipment` |
| `saveMaterial(dateKey, entry)` | `POST /api/reports/{date}/materials` |
| `saveAttachments(dateKey, entry)` | `POST /api/reports/{date}/attachments` (multipart) |
| `saveSignedReport(dateKey, entry)` | `POST /api/reports/{date}/sign` |
| `getReportForDate(date)` | `GET /api/reports/{date}` |
| `getSignedReportDateKeys()` | `GET /api/reports/signed-dates` |
| `getSafetyTalks()` | `GET /api/safety-talks` |
| `addScheduledSafetyTalk(...)` | `POST /api/safety-talks` |
| `updateScheduledSafetyTalk(...)` | `PUT /api/safety-talks/{id}` |
| `deleteScheduledSafetyTalk(id)` | `DELETE /api/safety-talks/{id}` |

### 8.3 Recommended Storage Layer Pattern

Create a thin adapter layer so the frontend doesn't need to change:

```typescript
// src/lib/api/adapter.ts
// Drop-in replacements for the current localStorage functions

export async function saveNotes(dateKey: string, entry: NoteEntry): Promise<void> {
  if (USE_API) {
    await api.post(`/api/reports/${dateKey}/notes`, entry);
  } else {
    // fallback to localStorage for offline
    appendLocalEntry(`notes_${dateKey}`, entry);
  }
}
```

### 8.4 Next.js API Routes to Create

```
app/api/
├── reports/
│   ├── [date]/
│   │   ├── route.ts              # GET (full report), PUT (update)
│   │   ├── notes/route.ts        # GET, POST
│   │   ├── chemicals/route.ts    # GET, POST
│   │   ├── metrics/route.ts      # GET, POST
│   │   ├── survey/route.ts       # GET, POST
│   │   ├── equipment/route.ts    # GET, POST
│   │   ├── materials/route.ts    # GET, POST
│   │   ├── attachments/route.ts  # GET, POST (multipart upload)
│   │   └── sign/route.ts         # POST (sign report)
│   └── signed-dates/route.ts     # GET list of signed dates
├── safety-talks/
│   ├── route.ts                   # GET all, POST new
│   └── [id]/route.ts              # GET, PUT, DELETE
├── projects/route.ts              # GET list of projects
└── users/
    └── me/route.ts                # GET current user profile
```

### 8.5 Authentication Flow to Add

```
app/
├── login/page.tsx          # Login screen (currently missing)
└── api/
    └── auth/
        ├── login/route.ts  # POST credentials → JWT/session
        └── logout/route.ts # POST → invalidate session
```

Add middleware:
```typescript
// middleware.ts (root)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 9. Frontend Component → API Plug-in Points

Each form component has a `handleSubmit` function. The only change needed is replacing the storage call with an API call. Here's what to change in each:

### Pattern (same for all forms)

```typescript
// BEFORE (localStorage):
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  const dateKey = getDateKey(getReportDate());
  saveNotes(dateKey, { id, project, timestamp, category, notes, photos });
  await new Promise(r => setTimeout(r, 800)); // fake delay
  setIsSubmitting(false);
  setShowSuccess(true);
};

// AFTER (API):
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const dateKey = getDateKey(getReportDate());
    await fetch(`/api/reports/${dateKey}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, notes, photos }),
    });
    setShowSuccess(true);
  } catch (err) {
    setError('Failed to save. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Files to Update for API Migration

| File | Storage Function to Replace |
|------|-----------------------------|
| `Notes.tsx` | `saveNotes()` |
| `MaterialLog.tsx` | `saveChemicals()` |
| `DailyMetrics.tsx` | `saveMetrics()` |
| `Survey.tsx` | `saveSurvey()` |
| `DailyChecklist.tsx` | `saveEquipmentChecklist()` |
| `SubmitAttachments.tsx` | `saveAttachments()` |
| `SubmitForm.tsx` | `saveMaterial()`, `saveEquipment()` |
| `Home.tsx` | `getReportForDate()`, `getSignedReport()` (for calendar indicators) |
| `NotesList.tsx` | read array from localStorage |
| `AttachmentsList.tsx` | read array from localStorage |
| `Reports.tsx` | `getSignedReportDateKeys()`, `getSignedReport()` |
| `SafetyList.tsx` | `getSafetyTalks()` |
| `SafetyScheduleForm.tsx` | `addScheduledSafetyTalk()`, `updateScheduledSafetyTalk()`, `deleteScheduledSafetyTalk()` |

### Reading Data for Lists

```typescript
// BEFORE: NotesList.tsx reads from localStorage
const notes = readArray<NoteEntry>(`notes_${dateKey}`);

// AFTER: Fetch from API
const [notes, setNotes] = useState<NoteEntry[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(`/api/reports/${dateKey}/notes`)
    .then(r => r.json())
    .then(data => { setNotes(data); setLoading(false); });
}, [dateKey]);
```

---

## 10. Suggested New Features

1. **Authentication** — Login page with JWT auth, user profile from API
2. **Offline Support** — Service Worker + background sync (already has PWA manifest)
3. **Activity Feed** — Implement `ActivityHistory.tsx` by aggregating all submission types
4. **Photo Uploads** — Upload base64/files to S3/Cloudflare R2 instead of localStorage data URLs
5. **Real Weather** — Integrate OpenWeatherMap API for report weather sections
6. **Projects from DB** — Replace hardcoded project list with `/api/projects`
7. **Push Notifications** — Remind field workers to submit daily reports
8. **PDF Export** — Use `react-pdf` or server-side PDF generation for report download
9. **Multi-device Sync** — Essential once localStorage is replaced with a real backend
10. **Role-based Access** — Supervisor vs Field Worker view differentiation
