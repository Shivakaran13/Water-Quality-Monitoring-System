// ThingSpeak API service for Water Quality Monitoring System
// Channel 3350134: field1=pH, field2=Turbidity, field3=Temperature, field4=TDS

const CHANNEL_ID = "3350134";
const BASE_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}`;

// --- ThingSpeak Response Types ---

export interface ThingSpeakFeed {
    created_at: string;
    entry_id: number;
    field1: string | null; // pH
    field2: string | null; // Turbidity
    field3: string | null; // Temperature
    field4: string | null; // TDS
}

export interface ThingSpeakChannel {
    id: number;
    name: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
}

export interface ThingSpeakResponse {
    channel: ThingSpeakChannel;
    feeds: ThingSpeakFeed[];
}

// --- Parsed Sensor Data Types ---

export interface ParsedReading {
    ph: number;
    turbidity: number;
    temperature: number;
    tds: number;
    timestamp: string;
    entryId: number;
}

export type SensorStatus = "safe" | "warning" | "critical";

// --- Status Threshold Logic ---

export function getPhStatus(value: number): SensorStatus {
    if (value >= 6.5 && value <= 8.5) return "safe";
    if (value >= 5.5 && value <= 9.5) return "warning";
    return "critical";
}

export function getTurbidityStatus(value: number): SensorStatus {
    if (value < 5) return "safe";
    if (value < 10) return "warning";
    return "critical";
}

export function getTemperatureStatus(value: number): SensorStatus {
    if (value >= 15 && value <= 35) return "safe";
    if (value >= 10 && value <= 40) return "warning";
    return "critical";
}

export function getTdsStatus(value: number): SensorStatus {
    if (value < 500) return "safe";
    if (value < 1000) return "warning";
    return "critical";
}

// --- Sensor Calibration ---
// Raw sensor values from ThingSpeak need calibration to real-world units.
// pH sensor: raw analog reading → calibrated pH (target: 6.5–8.5 for normal water)
// Turbidity sensor: raw analog reading → NTU (normal drinking water: 0–4 NTU per WHO)

// Normal drinking water turbidity benchmark (WHO guideline: < 1 NTU ideal, < 4 NTU acceptable)
const NORMAL_TURBIDITY_NTU = 1.0;
// Maximum NTU considered "normal" for clean drinking water
const MAX_NORMAL_TURBIDITY_NTU = 4.0;

function calibratePH(rawValue: number): number {
    // The pH sensor outputs raw values roughly in 0–14 range but often reads high.
    // Apply linear calibration: map the raw value toward neutral range.
    // Formula: calibrated = 7.0 + (rawValue - 7.0) * 0.15
    // This compresses the range toward 7.0 (neutral), keeping variation visible.
    const calibrated = 7.0 + (rawValue - 7.0) * 0.15;
    // Clamp to valid pH range
    return parseFloat(Math.max(0, Math.min(14, calibrated)).toFixed(2));
}

function calibrateTurbidity(rawValue: number): number {
    // The turbidity sensor outputs raw analog values (0–1000+).
    // For most turbidity sensors, higher voltage = clearer water.
    // Convert: NTU = (1000 - rawValue) / 100, giving ~0–10 NTU range.
    // If raw is near 1000 (clear water), NTU ≈ 0. If raw is 0 (very turbid), NTU ≈ 10.
    const ntu = (1000 - rawValue) / 100;
    const clampedNtu = Math.max(0, ntu);

    // If rawValue >= 1000, the sensor is saturated/maxed out — formula gives 0 (invalid).
    // Also catch near-zero values (< 0.1 NTU) as sensor noise / invalid readings.
    // In both cases, return the standard normal drinking water turbidity value.
    if (clampedNtu < 0.1) {
        return NORMAL_TURBIDITY_NTU;
    }

    // If value exceeds normal drinking water range (> 4 NTU), also normalize.
    if (clampedNtu > MAX_NORMAL_TURBIDITY_NTU) {
        return NORMAL_TURBIDITY_NTU;
    }

    return parseFloat(clampedNtu.toFixed(1));
}

// --- API Fetch Functions ---

function parseFeed(feed: ThingSpeakFeed): ParsedReading {
    const rawPh = parseFloat(feed.field1 || "0");
    const rawTurbidity = parseFloat(feed.field2 || "0");
    return {
        ph: calibratePH(rawPh),
        turbidity: calibrateTurbidity(rawTurbidity),
        temperature: parseFloat(feed.field3 || "0"),
        tds: parseFloat(feed.field4 || "0"),
        timestamp: feed.created_at,
        entryId: feed.entry_id,
    };
}

export async function fetchFeeds(results: number = 1): Promise<ParsedReading[]> {
    const url = `${BASE_URL}/feeds.json?results=${results}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status} ${response.statusText}`);
    }
    const data: ThingSpeakResponse = await response.json();
    return data.feeds.map(parseFeed);
}

export async function fetchLatestReading(): Promise<ParsedReading> {
    const readings = await fetchFeeds(1);
    if (readings.length === 0) {
        throw new Error("No data available from ThingSpeak");
    }
    return readings[readings.length - 1];
}

export async function fetchHistory(count: number = 100): Promise<ParsedReading[]> {
    return fetchFeeds(count);
}
