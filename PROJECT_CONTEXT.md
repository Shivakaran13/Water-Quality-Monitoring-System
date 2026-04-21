# AquaMonitor — Complete Project Context

> **Project Name:** AquaMonitor (repo: `clear-stream-scope`)  
> **Purpose:** IoT Water Quality Monitoring System — a real-time frontend dashboard for monitoring water tanks, sensor readings (Temperature, pH, Turbidity, Water Level), alerts, analytics, and AI-powered predictions.  
> **Status:** Frontend-only (no backend). All data is mock/static. Ready for backend integration.

---

## 1. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Build Tool** | Vite | 5.x |
| **Framework** | React | 18.3 |
| **Language** | TypeScript | 5.8 |
| **Styling** | Tailwind CSS | 3.4 |
| **UI Components** | shadcn/ui (Radix primitives) | Latest |
| **Animations** | Framer Motion | 12.x |
| **Charts** | Recharts | 2.x |
| **Routing** | React Router DOM | 6.x |
| **State/Data Fetching** | TanStack React Query | 5.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Icons** | Lucide React | 0.462 |
| **Toasts** | Sonner + Radix Toast | — |
| **Fonts** | Inter (sans) + JetBrains Mono (mono) | Google Fonts |
| **Testing** | Vitest + Testing Library | 3.x / 16.x |
| **Linting** | ESLint | 9.x |
| **Package Manager** | npm (also has bun.lockb) | — |

### Dev Server
- Runs on `http://localhost:8080` (configured in `vite.config.ts`)
- Uses `@vitejs/plugin-react-swc` for fast JSX transform
- Uses `lovable-tagger` plugin in development mode (Lovable platform integration)
- Path alias: `@` → `./src`

---

## 2. Project Structure

```
clear-stream-scope/
├── public/                     # Static assets
├── src/
│   ├── main.tsx                # Entry point — renders <App /> into #root
│   ├── App.tsx                 # Root component — routing + providers
│   ├── App.css                 # Minimal app-level styles
│   ├── index.css               # Global CSS — design tokens, glass effects, animations
│   ├── vite-env.d.ts           # Vite type declarations
│   │
│   ├── pages/                  # Route-level page components (9 files)
│   │   ├── Index.tsx           # Redirects or landing (minimal)
│   │   ├── Login.tsx           # Authentication page (mock login)
│   │   ├── Dashboard.tsx       # Main dashboard overview
│   │   ├── LiveMonitor.tsx     # Real-time sensor monitoring
│   │   ├── TankStatus.tsx      # Visual water tank status
│   │   ├── AlertsPage.tsx      # Filterable alert list
│   │   ├── Analytics.tsx       # Statistical analysis + charts
│   │   ├── SettingsPage.tsx    # User preferences & system config
│   │   └── NotFound.tsx        # 404 page
│   │
│   ├── components/
│   │   ├── NavLink.tsx         # Reusable navigation link
│   │   ├── dashboard/          # Dashboard-specific components (8 files)
│   │   │   ├── DashboardLayout.tsx  # Layout wrapper (sidebar + navbar + <Outlet>)
│   │   │   ├── AppSidebar.tsx       # Collapsible navigation sidebar
│   │   │   ├── Navbar.tsx           # Top navigation bar
│   │   │   ├── SensorCard.tsx       # Individual sensor reading card
│   │   │   ├── ChartSection.tsx     # Interactive historical chart
│   │   │   ├── WaterTank.tsx        # Animated water tank visual
│   │   │   ├── AlertsPanel.tsx      # Recent alerts list panel
│   │   │   └── PredictionCard.tsx   # AI prediction display card
│   │   └── ui/                 # shadcn/ui primitives (49 files)
│   │       ├── accordion.tsx, alert-dialog.tsx, avatar.tsx, badge.tsx,
│   │       │   breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx,
│   │       │   carousel.tsx, chart.tsx, checkbox.tsx, collapsible.tsx,
│   │       │   command.tsx, context-menu.tsx, dialog.tsx, drawer.tsx,
│   │       │   dropdown-menu.tsx, form.tsx, hover-card.tsx,
│   │       │   input-otp.tsx, input.tsx, label.tsx, menubar.tsx,
│   │       │   navigation-menu.tsx, pagination.tsx, popover.tsx,
│   │       │   progress.tsx, radio-group.tsx, resizable.tsx,
│   │       │   scroll-area.tsx, select.tsx, separator.tsx, sheet.tsx,
│   │       │   sidebar.tsx, skeleton.tsx, slider.tsx, sonner.tsx,
│   │       │   switch.tsx, table.tsx, tabs.tsx, textarea.tsx,
│   │       │   toast.tsx, toaster.tsx, toggle-group.tsx, toggle.tsx,
│   │       │   tooltip.tsx, and use-toast.ts
│   │       └── (These are standard shadcn/ui components - NOT customized)
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Responsive breakpoint detection hook
│   │   └── use-toast.ts        # Toast notification hook (shadcn)
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   │   └── mockData.ts         # All mock data + TypeScript interfaces
│   │
│   └── test/                   # Test files (2 files)
│
├── index.html                  # HTML entry (Vite SPA template)
├── package.json                # Dependencies & scripts
├── tailwind.config.ts          # Tailwind + design system config
├── postcss.config.js           # PostCSS (autoprefixer)
├── vite.config.ts              # Vite build config
├── vitest.config.ts            # Test config
├── tsconfig.json               # TypeScript project references
├── tsconfig.app.json           # App TypeScript config
├── tsconfig.node.json          # Node TypeScript config
├── eslint.config.js            # Linting rules
├── components.json             # shadcn/ui component config
└── .gitignore                  # Git ignore rules
```

---

## 3. Routing Architecture

All routing is defined in `App.tsx` using React Router v6:

```
/                  → Login.tsx         (standalone, no layout)
/dashboard         → Dashboard.tsx     (wrapped in DashboardLayout)
/live-monitor      → LiveMonitor.tsx   (wrapped in DashboardLayout)
/tank-status       → TankStatus.tsx    (wrapped in DashboardLayout)
/alerts            → AlertsPage.tsx    (wrapped in DashboardLayout)
/analytics         → Analytics.tsx     (wrapped in DashboardLayout)
/settings          → SettingsPage.tsx  (wrapped in DashboardLayout)
*                  → NotFound.tsx      (standalone, 404 catch-all)
```

### Layout System
- **DashboardLayout** wraps all authenticated routes using `<Outlet />`
- It provides: collapsible sidebar (desktop) + mobile overlay sidebar + top navbar
- Login page is standalone (no sidebar/navbar)

### Provider Stack (App.tsx)
```
QueryClientProvider (TanStack React Query)
  └── TooltipProvider (Radix)
       ├── Toaster (Radix toast)
       ├── Sonner (sonner toast)
       └── BrowserRouter (React Router)
            └── Routes
```

---

## 4. Data Layer — Mock Data (`src/lib/mockData.ts`)

The entire app runs on static/mock data. There is **no backend, no API calls, no database**.

### TypeScript Interfaces

```typescript
interface SensorReading {
  parameter: string;       // "Temperature", "pH Level", "Turbidity", "Water Level"
  value: number;           // Current value
  unit: string;            // "°C", "pH", "NTU", "%"
  icon: string;            // Emoji icon
  trend: "up" | "down" | "stable";
  trendValue: number;      // Numeric trend delta
  status: "safe" | "warning" | "critical";
  min: number;             // Minimum possible value
  max: number;             // Maximum possible value
}

interface AlertItem {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;       // "2026-03-02 14:32" format
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

interface HistoryPoint {
  time: string;
  temperature: number;
  ph: number;
  turbidity: number;
  waterLevel: number;
}
```

### Exported Data

| Export | Type | Description |
|---|---|---|
| `currentReadings` | `SensorReading[]` | 4 sensor cards: Temperature (24.7°C, safe), pH (7.2, safe), Turbidity (4.8 NTU, warning), Water Level (78%, safe) |
| `recentAlerts` | `AlertItem[]` | 5 alerts with severities: high (turbidity), critical (pH), medium (temp), high (water level), low (turbidity) |
| `historyData` | `Record<"1h"|"24h"|"7d"|"30d", HistoryPoint[]>` | Generated via `generateHistory()` — sinusoidal + random data for chart display |
| `locations` | `Array<{id, name, status}>` | 3 monitoring stations: Alpha (online), Beta (online), Gamma (offline) |
| `statsData` | `object` | Daily/weekly/monthly averages + min/max ranges for all 4 parameters |

### Data Generation
The `generateHistory(hours)` function creates time-series data:
- **1h**: 5-minute intervals
- **24h**: 30-minute intervals
- **7d**: 6-hour intervals
- **30d**: 24-hour intervals
- Values use `Math.sin()` for cyclic patterns + `Math.random()` for noise

---

## 5. Page-by-Page Breakdown

### 5.1 Login Page (`/`)
- **Brand:** "AquaMonitor — Smart Water Quality Monitoring"
- **Fields:** Email + Password (with show/hide toggle)
- **Auth:** Mock — any credentials work, 1.2s delay then redirect to `/dashboard`
- **UI:** Full-screen centered card, glass morphism, animated background blobs, Framer Motion entrance animations
- **Version badge:** "IoT Water Quality Monitoring System v2.0"

### 5.2 Dashboard (`/dashboard`)
Main overview page with 4 sections:
1. **Sensor Cards Grid** (4 cards, responsive 1→2→4 columns) — shows current value, trend arrow, status badge, animated progress bar
2. **Charts + Tank** (2/3 + 1/3 layout) — ChartSection (interactive, switchable params/timeframes) + WaterTank (animated fill + wave)
3. **Alerts + Prediction** (2/3 + 1/3 layout) — AlertsPanel (recent alerts list) + PredictionCard (AI forecast)
4. **Export button** in header (non-functional UI only)

### 5.3 Live Monitor (`/live-monitor`)
- **4 sensor cards** (2-column grid) each showing: icon, parameter name, live value, status indicator with animated ripple, mini sparkline chart (last 20 data points from 1h history)
- **System Vitals** section: Uptime (99.7%), Data Points (12,847), Sensors Active (4/4), Last Sync (2s ago) — all hardcoded
- Sparkline charts use `recharts` LineChart

### 5.4 Tank Status (`/tank-status`)
- **4 tanks** in 2-column grid, each with:
  - Animated water fill (Framer Motion height animation with staggered delay)
  - SVG wave animation at water surface
  - Status badge: Normal / Near Full / Critical (based on level)
  - Stats: Capacity (L), Flow Rate (L/m), Last Checked
- **Tank data (hardcoded):**
  - Main Reservoir: 78%, 5000L, 12.3 L/m
  - Treatment Tank A: 45%, 3000L, 8.1 L/m
  - Treatment Tank B: 92%, 3000L, 5.7 L/m (Near Full)
  - Distribution Tank: 15%, 4000L, 14.2 L/m (Critical)

### 5.5 Alerts Page (`/alerts`)
- **Summary cards** (4): Count per severity (critical/high/medium/low), clickable to filter
- **Filters:** Parameter buttons (All, Temperature, pH, Turbidity, Water Level) + severity toggle
- **Alert list:** Each alert shows icon, parameter, severity badge, message, value, timestamp
- **Critical alerts** have `animate-alert-flash` CSS animation
- **Filtering logic:** Client-side via React `useState` — filters by severity AND parameter

### 5.6 Analytics (`/analytics`)
- **4 stat summary cards** showing: daily average, % change vs weekly, min/max range, animated progress bar
- **Monthly Temperature Trend** — Recharts `AreaChart` with gradient fill, 30-day data
- **pH Level Distribution** — Recharts `BarChart` with 30-day data (sampled every 3rd point)
- Uses `statsData` from mockData for computed summary values

### 5.7 Settings Page (`/settings`)
- **Profile Section:** Name, Email, Role (disabled), Station — editable `<input>` fields
- **Notifications:** 3 toggles — Push Notifications, Critical Alerts, Weekly Email Reports
- **System:** Auto Sync toggle, Sampling Interval dropdown (5s/10s/30s/1min), Firmware Version display (v2.4.1)
- **Custom Toggle component** built in-line with Framer Motion spring animation
- **Save button** (non-functional)
- All settings are local state only — no persistence

---

## 6. Component Architecture

### 6.1 DashboardLayout
```
DashboardLayout
├── AppSidebar (desktop, collapsible: 72px ↔ 240px)
├── Mobile Sidebar Overlay (backdrop blur + slide-in)
├── Navbar (sticky top)
└── <Outlet /> (page content via React Router)
```
- Dynamic `margin-left` via inline `<style>` tag based on sidebar collapse state
- Mobile sidebar uses Framer Motion for slide-in/fade overlay

### 6.2 AppSidebar
- **6 nav items:** Dashboard, Live Monitor, Tank Status, Alerts, Analytics, Settings
- Active route indicator: animated bar (Framer Motion `layoutId="sidebar-active"`)
- Collapse button at bottom rotates chevron icon
- Brand: Droplets icon + "AquaMonitor" text (hides on collapse)

### 6.3 Navbar
- **Left:** Mobile menu button + System status (online/offline) + Location selector dropdown (3 stations)
- **Right:** Live clock (updates every 1s) + Notification bell (with red pulse dot) + Profile dropdown (name, email, sign-out)
- All dropdowns use local `useState` + Framer Motion entrance animations

### 6.4 SensorCard
- Props: `SensorReading` + `index` (for stagger delay)
- Shows: parameter name, emoji icon, value + unit, trend icon, status badge
- Animated progress bar shows value within min/max range
- Hover effect: `whileHover={{ y: -4 }}`
- Status-dependent styling: glow effect (safe=green, warning=amber, critical=red)

### 6.5 ChartSection
- **Parameter selector:** 4 buttons (Temperature, pH, Turbidity, Water Level)
- **Time range selector:** 4 buttons (1h, 24h, 7d, 30d)
- **Chart:** Recharts `AreaChart` with gradient fill, responsive container
- Color per parameter: orange, cyan, purple, emerald

### 6.6 WaterTank
- Props: `level` (0-100)
- Animated water fill with SVG wave animation on surface
- Level markers at 25%, 50%, 75% (dashed lines)
- Status logic: <20% = Critical/destructive, >90% = Near Overflow/warning, else = Normal/success
- Info panel: capacity, current volume, flow rate

### 6.7 AlertsPanel
- Props: `AlertItem[]`
- Severity-based styling: `low` → info/primary, `medium` → warning, `high` → destructive, `critical` → destructive + flash animation
- Scrollable list with max height

### 6.8 PredictionCard
- **Hardcoded AI prediction data:**
  - Water Quality Stability: 87%
  - Risk Level: Low
  - Forecasts: Temperature (Stable →), pH Level (Slight drop ↓), Turbidity (Improving ↓)
- Gradient border effect via `gradient-border` CSS class

---

## 7. Design System

### 7.1 Color Palette (HSL CSS Variables)

| Token | HSL Value | Usage |
|---|---|---|
| `--primary` | `205 85% 45%` | Main blue — buttons, active states, links |
| `--accent` | `195 80% 42%` | Secondary teal — accents, gradients |
| `--success` | `160 65% 40%` | Green — safe status indicators |
| `--warning` | `38 92% 50%` | Amber — warning states |
| `--destructive` | `0 72% 55%` | Red — critical alerts, errors |
| `--background` | `210 50% 96%` | Page background (light blue-gray) |
| `--foreground` | `210 40% 14%` | Text color (dark blue-gray) |
| `--card` | `210 60% 98%` | Card backgrounds |
| `--muted` | `210 30% 92%` | Muted backgrounds |
| `--sidebar-background` | `210 55% 20%` | Dark sidebar background |
| `--sidebar-primary` | `200 90% 60%` | Sidebar active blue |

### 7.2 Typography
- **Sans:** Inter (weights: 300–800)
- **Mono:** JetBrains Mono (weights: 400–600) — used for values/numbers
- Anti-aliased rendering globally

### 7.3 Glass Morphism Effects
```css
.glass-panel        → bg-card/70, backdrop-blur-xl, border-border/50, shadow-lg
.glass-panel-strong → bg-card/85, backdrop-blur-2xl, border-border/60, shadow-xl
```

### 7.4 Glow Effects
```css
.glow-primary      → blue box-shadow
.glow-success      → green box-shadow
.glow-warning      → amber box-shadow
.glow-destructive  → red box-shadow
```

### 7.5 Background Gradients
```css
.water-bg      → light blue gradient (pages)
.water-bg-deep → dark blue gradient (sidebar)
```

### 7.6 Custom Animations
| Animation | Effect | Duration |
|---|---|---|
| `animate-water` | Water wave vertical bounce | 3s infinite |
| `animate-pulse-glow` | Opacity pulse (0.6 → 1) | 2s infinite |
| `animate-alert-flash` | Flash (1 → 0.4 opacity) | 1s infinite |
| `animate-ripple` | Scale up + fade out | 2s infinite |
| `fade-in` | translateY + opacity | 0.4s |
| `scale-in` | Scale 0.95→1 + opacity | 0.3s |
| `slide-in-left` | translateX + opacity | 0.3s |

### 7.7 Scrollbar
Custom WebKit scrollbar: 6px wide, rounded, subtle gray colors.

---

## 8. Hooks

### `use-mobile.tsx`
- Detects mobile viewport using `window.matchMedia`
- Breakpoint: `768px`
- Returns `boolean` — `true` if mobile

### `use-toast.ts`
- Toast notification system from shadcn/ui
- Manages toast queue with add/update/dismiss/remove actions
- Max 1 toast visible at a time, auto-dismiss after cooldown

---

## 9. Scripts & Commands

```bash
npm run dev        # Start Vite dev server (port 8080)
npm run build      # Production build
npm run build:dev  # Development build
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run Vitest once
npm run test:watch # Run Vitest in watch mode
```

---

## 10. Key Architectural Decisions

1. **Frontend-only:** No backend exists. All data comes from `mockData.ts`. This is a prototype/demo.
2. **No authentication:** Login is mock — any credentials work, there's no token/session management.
3. **No state management library:** All state is local `useState`. No Redux/Zustand/Jotai.
4. **No real-time data:** Despite "Live Monitor" branding, data is static. No WebSocket/SSE/polling.
5. **No persistence:** Settings changes, form inputs, etc. are lost on refresh.
6. **Glass morphism design:** Heavy use of blur, transparency, and glow effects throughout.
7. **Framer Motion everywhere:** Every page/component uses entrance animations and hover effects.
8. **shadcn/ui primitives:** 49 UI components pulled in (many unused) — provides the base component library.
9. **Lovable platform:** Generated/scaffolded via Lovable.dev (indicated by `lovable-tagger` and README).

---

## 11. What's Missing (For Production)

| Area | What's Needed |
|---|---|
| **Backend API** | REST or GraphQL endpoints for real sensor data |
| **Authentication** | JWT/OAuth, protected routes, token refresh |
| **Real-time data** | WebSocket or MQTT for live sensor feeds |
| **Database** | Time-series DB (InfluxDB, TimescaleDB) for sensor history |
| **IoT Integration** | MQTT broker, device registration, firmware OTA |
| **State Management** | Zustand or React Context for shared state |
| **Error Handling** | Error boundaries, API error states, retry logic |
| **Loading States** | Skeleton screens, suspense boundaries |
| **Dark Mode** | CSS variables exist but only light theme is defined |
| **Accessibility** | ARIA labels, keyboard navigation, screen reader support |
| **Testing** | Tests directory exists but minimal coverage |
| **PWA Support** | Service worker, offline mode, push notifications |
| **Deployment** | CI/CD pipeline, Docker, environment configs |

---

## 12. File-by-File Reference

### Pages

| File | Lines | Purpose |
|---|---|---|
| `pages/Index.tsx` | 14 | Minimal index/redirect |
| `pages/Login.tsx` | 144 | Mock login with animated UI |
| `pages/Dashboard.tsx` | 52 | Main overview with 4 sensor cards, chart, tank, alerts, prediction |
| `pages/LiveMonitor.tsx` | 109 | Real-time display with sparklines + system vitals |
| `pages/TankStatus.tsx` | 97 | 4 animated water tanks with stats |
| `pages/AlertsPage.tsx` | 124 | Filterable alert list (severity + parameter) |
| `pages/Analytics.tsx` | 122 | Stat cards + area chart + bar chart |
| `pages/SettingsPage.tsx` | 132 | Profile, notifications, system settings |
| `pages/NotFound.tsx` | ~20 | 404 page |

### Dashboard Components

| File | Lines | Props | Purpose |
|---|---|---|---|
| `DashboardLayout.tsx` | 54 | — | Layout with sidebar + navbar + outlet |
| `AppSidebar.tsx` | 129 | `collapsed`, `onToggle` | Animated collapsible nav sidebar |
| `Navbar.tsx` | 130 | `onMenuToggle` | Top bar: status, location selector, clock, profile |
| `SensorCard.tsx` | 78 | `reading: SensorReading`, `index` | Individual sensor display card |
| `ChartSection.tsx` | 125 | — | Interactive historical chart (param + time selectors) |
| `WaterTank.tsx` | 103 | `level: number` | Animated tank visualization |
| `AlertsPanel.tsx` | 91 | `alerts: AlertItem[]` | Recent alerts list |
| `PredictionCard.tsx` | 74 | — | AI prediction display |

### Utilities

| File | Lines | Purpose |
|---|---|---|
| `lib/utils.ts` | 6 | `cn()` — className merge utility (clsx + tailwind-merge) |
| `lib/mockData.ts` | 176 | All mock data + TypeScript interfaces + history generator |
| `hooks/use-mobile.tsx` | ~20 | Mobile breakpoint detection |
| `hooks/use-toast.ts` | ~100 | Toast notification system |

---

*Generated on 2026-04-21. This document covers the complete codebase of the AquaMonitor project.*
