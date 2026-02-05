# 🗺️ Codebase Tour: OnTrack

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [API Layer](#api-layer)
- [State Management](#state-management)
- [Styling](#styling)
- [Build & Deploy](#build--deploy)

---

## 🎯 Project Overview

**OnTrack** is a Progressive Web App (PWA) that helps users check Taiwan Railway (TRA) train schedules and share arrival times with family. It integrates with the TDX (Transport Data eXchange) API to provide real-time train schedules and delays.

### Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Custom CSS
- **API:** Serverless functions (Vercel)
- **Data Source:** TDX Taiwan Railway API
- **PWA:** Vite Plugin PWA (service worker, offline support)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend (Vite)          │
│  ┌─────────────────────────────────┐   │
│  │     App.tsx (Main Container)    │   │
│  │  ┌──────────────────────────┐   │   │
│  │  │  StationSelector         │   │   │
│  │  │  TrainList               │   │   │
│  │  │  ShareCard               │   │   │
│  │  │  Settings                │   │   │
│  │  └──────────────────────────┘   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↕ HTTP
┌─────────────────────────────────────────┐
│       Serverless API Functions          │
│  ┌─────────────┐   ┌───────────────┐   │
│  │ /api/       │   │ /api/         │   │
│  │ stations    │   │ schedule      │   │
│  └─────────────┘   └───────────────┘   │
└─────────────────────────────────────────┘
                    ↕ OAuth2 + HTTP
┌─────────────────────────────────────────┐
│         TDX Transport Data API          │
│    (Taiwan Railway Administration)      │
└─────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
OnTrack/
├── 📂 api/                    # Serverless API functions (Vercel)
│   ├── _utils/
│   │   └── tdx.ts            # TDX API client with OAuth2
│   ├── schedule.ts           # Train schedule endpoint
│   └── stations.ts           # Station list endpoint
│
├── 📂 src/                    # React application source
│   ├── 📂 api/
│   │   └── client.ts         # Frontend API client with caching
│   ├── 📂 components/
│   │   ├── Badge.tsx             # Status badge component
│   │   ├── IconButton.tsx        # Reusable icon button
│   │   ├── InitialLoadingScreen.tsx  # App loading splash
│   │   ├── IOSInstallPrompt.tsx  # iOS PWA install prompt
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── Settings.tsx          # Settings panel
│   │   ├── ShareCard.tsx         # Message bar with share
│   │   ├── StationDropdown.tsx   # Reusable station picker
│   │   ├── StationSelector.tsx   # Origin/dest selector
│   │   ├── TrainList.tsx         # Train schedule display
│   │   ├── TrainListSkeleton.tsx # Loading skeleton
│   │   └── index.ts              # Component exports
│   ├── 📂 constants/
│   │   ├── strings.ts        # Centralized UI strings
│   │   └── index.ts          # Constants exports
│   ├── 📂 hooks/
│   │   ├── usePersistence.ts # localStorage hook
│   │   └── index.ts          # Hooks exports
│   ├── 📂 assets/            # Images, icons, etc.
│   ├── App.tsx               # Main app container
│   ├── App.css               # Component-specific styles
│   ├── index.css             # Global styles
│   ├── main.tsx              # React entry point
│   └── types.ts              # TypeScript interfaces
│
├── 📂 docs/                   # Documentation
│   ├── CACHING_ARCHITECTURE.md   # Multi-layer caching docs
│   ├── TDX_RAIL_API.json         # API reference
│   └── CODEBASE_TOUR.md          # This file
│
├── 📂 public/                 # Static assets
│   └── splash/               # PWA splash screens
│
├── 📂 scripts/                # Build scripts
│   └── generate-pwa-assets.js # PWA asset generator
│
├── vite.config.ts            # Vite + PWA configuration
├── vercel.json               # Vercel deployment config
├── tsconfig.json             # TypeScript configuration
├── eslint.config.js          # ESLint rules
├── package.json              # Dependencies & scripts
└── README.md                 # Project readme
```

---

## 🧩 Core Components

### 1. **App.tsx** (Main Container)

**Location:** [src/App.tsx](../src/App.tsx)

The root component that orchestrates the entire application.

**Key Responsibilities:**

- Manages global state via `usePersistence` hook
- Fetches station list on mount
- Coordinates data flow between components
- Handles station selection → train list → share card flow
- Manages settings panel visibility

**State Flow:**

```tsx
usePersistence() // localStorage wrapper
    ↓
stations (fetched from API)
    ↓
StationSelector (user picks origin/dest)
    ↓
TrainList (auto-fetches schedule)
    ↓
ShareCard (generates shareable message)
```

---

### 2. **StationSelector**

**Location:** [src/components/StationSelector.tsx](../src/components/StationSelector.tsx)

**Features:**

- Dual station pickers (origin & destination) using `StationDropdown`
- Auto-detect origin via geolocation (when enabled)
- Auto-fill destination from default settings
- Caches last selected origin in localStorage

**Props:**

```typescript
interface StationSelectorProps {
    stations: Station[];
    originId: string;
    setOriginId: (id: string) => void;
    destId: string;
    setDestId: (id: string) => void;
    defaultDestId?: string;
    autoDetectOrigin: boolean;
}
```

**Auto-Detection Logic:**

```typescript
// When autoDetectOrigin is enabled:
// 1. Request geolocation
// 2. Find nearest station by lat/lon distance
// 3. Cache selection in localStorage

// When disabled:
// 1. Use cached origin from localStorage
// 2. Fallback to first station
```

---

### 3. **StationDropdown**

**Location:** [src/components/StationDropdown.tsx](../src/components/StationDropdown.tsx)

**Features:**

- Reusable dropdown component for station selection
- Real-time search filtering (by Chinese name or English)
- Click-outside to close
- Used by both `StationSelector` and `Settings`

---

### 4. **TrainList**

**Location:** [src/components/TrainList.tsx](../src/components/TrainList.tsx)

**Features:**

- Auto-fetches schedule when origin/dest changes
- Displays 3 trains centered around current time
- Shows train status (on-time, delayed) with `Badge` component
- Auto-selects recommended train (next departure)
- Click to select different train
- Auto-refresh every 30 seconds
- Pull-to-refresh on mobile
- Prevents duplicate requests within 3 seconds

**Smart Train Selection:**

```typescript
// Find next train departing after current time
const nextTrainIndex = trains.findIndex(
    (t) => t.departureTime >= currentTimeStr
);

// Show context: 1 previous + 2 upcoming trains
const start = Math.max(0, nextTrainIndex - 1);
const displayTrains = res.trains.slice(start, start + 3);
```

**Props:**

```typescript
interface TrainListProps {
    originId: string;
    destId: string;
    onSelect: (train: TrainInfo) => void;
    selectedTrainNo: string | null;
}
```

---

### 5. **ShareCard**

**Location:** [src/components/ShareCard.tsx](../src/components/ShareCard.tsx)

**Features:**

- Editable message input (auto-generated from template)
- Calculates adjusted arrival time (includes delay)
- Share via Web Share API (mobile)
- Direct LINE share button
- Copy to clipboard fallback (desktop)

**Message Format:**

Default message uses `STRINGS.ARRIVAL_MESSAGE`:

```
{adjusted_time}到{dest}
```

Example: `14:35到新竹`

**Props:**

```typescript
interface ShareCardProps {
    train: TrainInfo | null;
    originName: string;
    destName: string;
}
```

---

### 6. **Settings**

**Location:** [src/components/Settings.tsx](../src/components/Settings.tsx)

**Features:**

- Toggle auto-detect origin (geolocation)
- Set default destination station
- Collapsible panel in header

**Props:**

```typescript
interface SettingsProps {
    stations: Station[];
    autoDetectOrigin: boolean;
    setAutoDetectOrigin: (value: boolean) => void;
    defaultDestId: string;
    setDefaultDestId: (id: string) => void;
    setDestId: (id: string) => void;
}
```

---

### 7. **Supporting Components**

| Component              | Location                                                               | Purpose                                |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------------- |
| `Badge`                | [Badge.tsx](../src/components/Badge.tsx)                               | Status badges (on-time, delayed, next) |
| `IconButton`           | [IconButton.tsx](../src/components/IconButton.tsx)                     | Styled icon buttons                    |
| `InitialLoadingScreen` | [InitialLoadingScreen.tsx](../src/components/InitialLoadingScreen.tsx) | Full-screen loading splash             |
| `IOSInstallPrompt`     | [IOSInstallPrompt.tsx](../src/components/IOSInstallPrompt.tsx)         | iOS PWA install instructions           |
| `LoadingSpinner`       | [LoadingSpinner.tsx](../src/components/LoadingSpinner.tsx)             | Inline loading indicator               |
| `TrainListSkeleton`    | [TrainListSkeleton.tsx](../src/components/TrainListSkeleton.tsx)       | Loading skeleton for train list        |

---

## 🌐 API Layer

### Frontend Client (`src/api/client.ts`)

Wrapper around fetch with caching and deduplication:

```typescript
export const api = {
    getStations: async (): Promise<Station[]> => {
        // Returns cached data if still valid (1 hour TTL)
        if (stationsCache && stationsCache.expires > now) {
            return stationsCache.data;
        }
        return fetchJson<Station[]>('/api/stations');
    },

    getSchedule: (origin: string, dest: string, date?: string) =>
        fetchJson<ScheduleResponse>(`/api/schedule?${params}`),
};
```

**Features:**

- In-flight request deduplication
- Stations cache (1 hour TTL)
- 429 rate limit retry with exponential backoff

---

### Backend API Functions

#### 1. **stations.ts** (`/api/stations`)

**Endpoint:** `GET /api/stations`

**Purpose:** Returns list of all TRA stations with coordinates

**Data Source:** TDX API → `/v3/Rail/TRA/Station`

**Response:**

```typescript
Station[] = [
  { id: "1000", name: "臺北", nameEn: "Taipei", lat: 25.0478, lon: 121.5170 },
  { id: "1008", name: "新竹", nameEn: "Hsinchu", lat: 24.8017, lon: 120.9714 },
  // ...
]
```

**Caching:**

- In-memory: 1 hour
- CDN: `s-maxage=3600, stale-while-revalidate=86400`

---

#### 2. **schedule.ts** (`/api/schedule`)

**Endpoint:** `GET /api/schedule?origin={id}&dest={id}&date={yyyy-MM-dd}`

**Purpose:** Returns train schedule between two stations with live delay data

**Query Params:**

- `origin` (required): Origin station ID
- `dest` (required): Destination station ID
- `date` (optional): Defaults to today in Taiwan timezone

**Data Flow:**

1. Fetch full daily timetable from TDX (cached 5 min)
2. Fetch live delay data (always fresh)
3. Filter trains stopping at both stations
4. Merge delay info into timetable
5. Return enriched train list

**TDX API Calls:**

```typescript
// 1. Schedule (cached)
const scheduleUrl = `v3/Rail/TRA/DailyTrainTimetable/Today`;

// 2. Live Delays (always fresh)
const delayUrl = 'v3/Rail/TRA/TrainLiveBoard';
```

**Caching:**

- In-memory timetable: 5 minutes
- CDN: `s-maxage=60, stale-while-revalidate=300`

---

### TDX API Client (`api/_utils/tdx.ts`)

**Core Utility:** Handles OAuth2 authentication and API requests to TDX

**Features:**

- Token caching with expiration tracking
- Auto-refresh before expiry (60s buffer)
- Fallback to visitor mode if credentials missing

**Environment Variables Required:**

```bash
TDX_CLIENT_ID=your_client_id
TDX_CLIENT_SECRET=your_client_secret
```

**Visitor Mode:**

- If credentials missing, API calls work but limited to 20 requests/day/IP

---

## 💾 State Management

### usePersistence Hook (`src/hooks/usePersistence.ts`)

**Purpose:** Wrapper around localStorage for persistent user preferences

**Persisted Data:**

| Key                          | Description                               |
| ---------------------------- | ----------------------------------------- |
| `ontrack_origin`             | Last selected origin station              |
| `ontrack_dest`               | Last selected destination station         |
| `ontrack_template`           | Custom message template                   |
| `ontrack_auto_detect_origin` | Whether to auto-detect origin by location |
| `ontrack_default_dest`       | Default destination station ID            |

**Usage:**

```typescript
const {
    originId,
    setOriginId,
    destId,
    setDestId,
    autoDetectOrigin,
    setAutoDetectOrigin,
    defaultDestId,
    setDefaultDestId,
} = usePersistence();

// Auto-saves to localStorage on every update
setOriginId('1000'); // Saves immediately
```

---

## 📝 Centralized Strings

### strings.ts (`src/constants/strings.ts`)

All user-facing strings are centralized for consistency and future localization:

```typescript
export const STRINGS = {
    // App Header
    APP_TITLE: 'OnTrack',

    // Labels
    SELECT_ROUTE: '選擇路線',
    SELECT_TRAIN: '選擇班次',
    SEARCH_STATION: '搜尋車站',

    // Train Status
    ON_TIME: 'On Time',
    NEXT_TRAIN: 'Next',
    DELAY_MINUTES: (minutes: number) => `+${minutes} min`,

    // Share Card
    ARRIVAL_MESSAGE: (time: string, station: string) => `${time}到${station}`,
    NO_TRAIN_MESSAGE: '好像沒車搭了',

    // Settings
    SETTINGS_AUTO_DETECT_ORIGIN: '自動偵測起點站',
    SETTINGS_DEFAULT_DESTINATION: '設定預設目的地',
    // ...
};
```

---

## 🎨 Styling

### Design System

- **Theme:** Dark mode
- **Responsive:** Mobile-first design

### File Organization

| File                   | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `src/index.css`        | Global styles, CSS variables, background  |
| `src/App.css`          | Main app layout, header, container styles |
| `src/components/*.css` | Component-specific styles (co-located)    |

### Key CSS Classes

```css
.train-card {
    cursor: pointer;
    transition: all 0.2s;
}

.train-card:hover {
    transform: translateY(-2px);
}
```

---

## 🛠️ Build & Deploy

### Development

```bash
vercel dev         # Start dev server with API functions
```

### Production Build

```bash
npm run build      # TypeScript compile + Vite build
npm run preview    # Preview production build locally
```

### Code Quality

```bash
npm run lint       # ESLint check
npm run format     # Prettier format
```

---

## 📱 Progressive Web App (PWA)

**Configuration:** `vite.config.ts`

**Features:**

- **Service Worker:** Auto-generated by `vite-plugin-pwa`
- **Offline Support:** Caches static assets
- **Install Prompt:** iOS-specific install instructions (`IOSInstallPrompt`)
- **Auto-Update:** New versions deploy seamlessly

**PWA Assets:**

Generated via `scripts/generate-pwa-assets.js` including splash screens in `public/splash/`

---

## 🔑 Key TypeScript Interfaces

### Station

```typescript
interface Station {
    id: string; // Station ID (e.g., "1000")
    name: string; // Chinese name (e.g., "臺北")
    nameEn: string; // English name (e.g., "Taipei")
    lat?: number; // Latitude (for geolocation)
    lon?: number; // Longitude (for geolocation)
}
```

### TrainInfo

```typescript
interface TrainInfo {
    trainNo: string; // Train number (e.g., "145")
    trainType: string; // Type (e.g., "自強號")
    direction: number; // 0: Shunxing, 1: Nixing
    originStation: string; // Starting station
    destinationStation: string; // Final destination
    departureTime: string; // HH:mm format
    arrivalTime: string; // HH:mm format
    delay?: number; // Minutes delayed (undefined = unknown)
    status: 'on-time' | 'delayed' | 'cancelled' | 'unknown';
}
```

---

## 🚀 Deployment (Vercel)

The project is configured for Vercel deployment:

1. **API Routes:** `/api/*` automatically deployed as serverless functions
2. **Frontend:** Static SPA served from `dist/`
3. **Environment:** Set `TDX_CLIENT_ID` and `TDX_CLIENT_SECRET` in Vercel dashboard
4. **Auto-Deploy:** Push to `main` branch triggers deployment

**Vercel Config (`vercel.json`):**

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

---

## 🔍 Data Flow Example

**User Journey: "I want to go from Taipei to Hsinchu"**

```
1. User lands on app
   → App.tsx loads
   → InitialLoadingScreen shows
   → usePersistence() restores settings from localStorage
   → Fetches stations from /api/stations
   → InitialLoadingScreen hides

2. Auto-detection (if enabled)
   → StationSelector requests geolocation
   → Finds nearest station by lat/lon
   → Sets origin automatically

3. User selects destination "Hsinchu" (1008)
   → StationDropdown filters stations
   → setDestId(id) saves to localStorage

4. TrainList detects origin/dest change
   → Shows TrainListSkeleton
   → Calls api.getSchedule('1000', '1008')
   → Backend fetches from TDX + merges delays
   → Returns 3 relevant trains
   → Auto-selects next departure

5. User clicks a different train
   → onSelect(train) callback updates App state
   → selectedTrain propagates to ShareCard

6. ShareCard generates message
   → Calculates adjusted arrival time (with delay)
   → Shows editable message: "14:35到新竹"
   → User can edit message

7. User clicks share button
   → navigator.share() on mobile (system share sheet)
   → Or LINE deep link for direct LINE share
   → Or navigator.clipboard.writeText() fallback
   → Message shared! 🎉
```

---

## 📚 Further Reading

- [Caching Architecture](./CACHING_ARCHITECTURE.md)
- [TDX Rail API Documentation](./TDX_RAIL_API.json)
- [Vite Documentation](https://vite.dev/)
- [React 19 Docs](https://react.dev/)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API)

---

## 🤝 Contributing

When adding features:

1. Update TypeScript interfaces in `src/types.ts`
2. Add strings to `src/constants/strings.ts`
3. Follow existing component patterns
4. Co-locate CSS with components
5. Test on mobile (PWA features)
6. Update this tour if architecture changes

---

**Happy Coding! 🚂💨**
