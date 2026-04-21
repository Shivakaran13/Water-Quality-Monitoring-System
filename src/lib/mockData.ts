// Data types and static fallback data for the water quality monitoring system
// Real-time data is now fetched from ThingSpeak via useThingSpeak hooks

export interface SensorReading {
  parameter: string;
  value: number;
  unit: string;
  icon: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  status: "safe" | "warning" | "critical";
  min: number;
  max: number;
}

export interface AlertItem {
  id: string;
  parameter: string;
  value: number;
  unit: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

export interface HistoryPoint {
  time: string;
  fullTime?: string;
  temperature: number;
  ph: number;
  turbidity: number;
  tds: number;
}

export const recentAlerts: AlertItem[] = [
  {
    id: "1",
    parameter: "Turbidity",
    value: 8.2,
    unit: "NTU",
    timestamp: "2026-03-02 14:32",
    severity: "high",
    message: "Turbidity exceeded safe threshold",
  },
  {
    id: "2",
    parameter: "pH Level",
    value: 5.1,
    unit: "pH",
    timestamp: "2026-03-02 13:15",
    severity: "critical",
    message: "pH level critically low - acidic water detected",
  },
  {
    id: "3",
    parameter: "Temperature",
    value: 32.5,
    unit: "°C",
    timestamp: "2026-03-02 11:45",
    severity: "medium",
    message: "Temperature approaching upper threshold",
  },
  {
    id: "4",
    parameter: "TDS",
    value: 1200,
    unit: "ppm",
    timestamp: "2026-03-02 10:20",
    severity: "high",
    message: "TDS level critically high",
  },
  {
    id: "5",
    parameter: "Turbidity",
    value: 6.1,
    unit: "NTU",
    timestamp: "2026-03-01 22:10",
    severity: "low",
    message: "Slight turbidity increase detected",
  },
];

export const locations = [
  { id: "loc-a", name: "Station Alpha", status: "online" as const },
  { id: "loc-b", name: "Station Beta", status: "online" as const },
  { id: "loc-c", name: "Station Gamma", status: "offline" as const },
];
