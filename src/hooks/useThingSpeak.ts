import { useQuery } from "@tanstack/react-query";
import {
    fetchLatestReading,
    fetchHistory,
    type ParsedReading,
    getPhStatus,
    getTurbidityStatus,
    getTemperatureStatus,
    getTdsStatus,
} from "@/lib/thingspeakApi";
import type { SensorReading, HistoryPoint } from "@/lib/mockData";

// Convert a ParsedReading into the SensorReading[] array used by the UI
function toSensorReadings(reading: ParsedReading): SensorReading[] {
    return [
        {
            parameter: "Temperature",
            value: parseFloat(reading.temperature.toFixed(1)),
            unit: "°C",
            icon: "🌡",
            trend: "stable",
            trendValue: 0,
            status: getTemperatureStatus(reading.temperature),
            min: 0,
            max: 50,
        },
        {
            parameter: "pH Level",
            value: parseFloat(reading.ph.toFixed(2)),
            unit: "pH",
            icon: "⚗",
            trend: "stable",
            trendValue: 0,
            status: getPhStatus(reading.ph),
            min: 0,
            max: 14,
        },
        {
            parameter: "Turbidity",
            value: parseFloat(reading.turbidity.toFixed(1)),
            unit: "NTU",
            icon: "🌫",
            trend: "stable",
            trendValue: 0,
            status: getTurbidityStatus(reading.turbidity),
            min: 0,
            max: 1500,
        },
        {
            parameter: "TDS",
            value: parseFloat(reading.tds.toFixed(0)),
            unit: "ppm",
            icon: "💧",
            trend: "stable",
            trendValue: 0,
            status: getTdsStatus(reading.tds),
            min: 0,
            max: 2000,
        },
    ];
}

// Compute trend by comparing current vs previous reading
function computeTrends(
    current: SensorReading[],
    previous: ParsedReading | null
): SensorReading[] {
    if (!previous) return current;

    const prevMap: Record<string, number> = {
        Temperature: previous.temperature,
        "pH Level": previous.ph,
        Turbidity: previous.turbidity,
        TDS: previous.tds,
    };

    return current.map((reading) => {
        const prevVal = prevMap[reading.parameter];
        if (prevVal === undefined) return reading;
        const diff = parseFloat((reading.value - prevVal).toFixed(2));
        const trend = diff > 0 ? "up" : diff < 0 ? "down" : "stable";
        return { ...reading, trend, trendValue: diff } as SensorReading;
    });
}

// Hook: Get current sensor readings with auto-refresh every 15s
export function useCurrentReadings() {
    return useQuery({
        queryKey: ["thingspeak", "current"],
        queryFn: async () => {
            // Fetch last 2 readings so we can compute trends
            const readings = await fetchHistory(2);
            const latest = readings[readings.length - 1];
            const previous = readings.length > 1 ? readings[readings.length - 2] : null;

            const sensorReadings = toSensorReadings(latest);
            return {
                readings: computeTrends(sensorReadings, previous),
                timestamp: latest.timestamp,
            };
        },
        refetchInterval: 15000, // Poll every 15 seconds
        staleTime: 10000,
    });
}

// Hook: Get historical data for charts
export function useHistoryData(count: number = 100) {
    return useQuery({
        queryKey: ["thingspeak", "history", count],
        queryFn: async () => {
            const data = await fetchHistory(count);
            const historyPoints: HistoryPoint[] = data.map((reading) => {
                const date = new Date(reading.timestamp);
                return {
                    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    fullTime: date.toLocaleString(),
                    temperature: parseFloat(reading.temperature.toFixed(1)),
                    ph: parseFloat(reading.ph.toFixed(2)),
                    turbidity: parseFloat(reading.turbidity.toFixed(1)),
                    tds: parseFloat(reading.tds.toFixed(0)),
                };
            });
            return historyPoints;
        },
        refetchInterval: 30000, // Refresh history every 30 seconds
        staleTime: 20000,
    });
}

// Hook: Get stats computed from real data
export function useStatsData(count: number = 100) {
    return useQuery({
        queryKey: ["thingspeak", "stats", count],
        queryFn: async () => {
            const data = await fetchHistory(count);
            if (data.length === 0) throw new Error("No data for stats");

            const stats = {
                temperature: { sum: 0, min: Infinity, max: -Infinity },
                ph: { sum: 0, min: Infinity, max: -Infinity },
                turbidity: { sum: 0, min: Infinity, max: -Infinity },
                tds: { sum: 0, min: Infinity, max: -Infinity },
            };

            data.forEach((r) => {
                stats.temperature.sum += r.temperature;
                stats.temperature.min = Math.min(stats.temperature.min, r.temperature);
                stats.temperature.max = Math.max(stats.temperature.max, r.temperature);

                stats.ph.sum += r.ph;
                stats.ph.min = Math.min(stats.ph.min, r.ph);
                stats.ph.max = Math.max(stats.ph.max, r.ph);

                stats.turbidity.sum += r.turbidity;
                stats.turbidity.min = Math.min(stats.turbidity.min, r.turbidity);
                stats.turbidity.max = Math.max(stats.turbidity.max, r.turbidity);

                stats.tds.sum += r.tds;
                stats.tds.min = Math.min(stats.tds.min, r.tds);
                stats.tds.max = Math.max(stats.tds.max, r.tds);
            });

            const n = data.length;
            // Use first half as "previous period" for comparison
            const half = Math.floor(n / 2);
            const recentData = data.slice(half);
            const olderData = data.slice(0, half);

            const avg = (arr: ParsedReading[], key: keyof ParsedReading) =>
                arr.reduce((s, r) => s + (r[key] as number), 0) / (arr.length || 1);

            return {
                avg: {
                    temperature: parseFloat((stats.temperature.sum / n).toFixed(1)),
                    ph: parseFloat((stats.ph.sum / n).toFixed(2)),
                    turbidity: parseFloat((stats.turbidity.sum / n).toFixed(1)),
                    tds: parseFloat((stats.tds.sum / n).toFixed(0)),
                },
                previousAvg: {
                    temperature: parseFloat(avg(olderData, "temperature").toFixed(1)),
                    ph: parseFloat(avg(olderData, "ph").toFixed(2)),
                    turbidity: parseFloat(avg(olderData, "turbidity").toFixed(1)),
                    tds: parseFloat(avg(olderData, "tds").toFixed(0)),
                },
                minMax: {
                    temperature: { min: stats.temperature.min, max: stats.temperature.max },
                    ph: { min: stats.ph.min, max: stats.ph.max },
                    turbidity: { min: stats.turbidity.min, max: stats.turbidity.max },
                    tds: { min: stats.tds.min, max: stats.tds.max },
                },
                totalReadings: n,
            };
        },
        refetchInterval: 60000,
        staleTime: 30000,
    });
}
