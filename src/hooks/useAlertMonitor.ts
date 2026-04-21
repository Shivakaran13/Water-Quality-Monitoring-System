// useAlertMonitor — Watches live sensor readings from ThingSpeak (every 15s)
// and triggers email alerts when any parameter is WARNING or CRITICAL.
// Cooldown is stored in localStorage (30 min per parameter+severity).
// The email server (email-server.js) also polls independently for reliability.

import { useEffect } from "react";
import { useCurrentReadings } from "@/hooks/useThingSpeak";
import {
  sendEmail,
  canSendAlert,
  markAlertSent,
} from "@/lib/brevoApi";
import { buildAlertEmailHtml } from "@/lib/emailTemplates";
import type { SensorReading } from "@/lib/mockData";
import { getResidentsFromFirestore, logAlertToFirestore } from "@/lib/firestore";

const ALERT_STATUSES = ["warning", "critical"] as const;
type AlertStatus = (typeof ALERT_STATUSES)[number];

function isAlertStatus(status: string): status is AlertStatus {
  return (ALERT_STATUSES as readonly string[]).includes(status);
}

export function useAlertMonitor() {
  const { data, dataUpdatedAt } = useCurrentReadings();

  // Run whenever new data is fetched (dataUpdatedAt changes on each poll cycle)
  useEffect(() => {
    async function processAlerts() {
      if (!data?.readings) return;

      const alertReadings = data.readings.filter(
        (r): r is SensorReading & { status: AlertStatus } => isAlertStatus(r.status)
      );

      if (alertReadings.length === 0) return;

      // Only fetch residents if we actually have active alerts
      const residents = await getResidentsFromFirestore();
      if (residents.length === 0) return;

      alertReadings.forEach(async (reading) => {
        const alertKey = `${reading.parameter}_${reading.status}`;

        // Only send if 30-minute cooldown has expired
        if (!canSendAlert(alertKey)) return;

      // Mark sent immediately to prevent duplicate sends in parallel
      markAlertSent(alertKey);

      const subject =
        reading.status === "critical"
          ? `🚨 CRITICAL: ${reading.parameter} contamination detected — AquaMonitor`
          : `⚠️ WARNING: ${reading.parameter} alert — AquaMonitor`;

      const html = buildAlertEmailHtml({
        parameter: reading.parameter,
        value: reading.value,
        unit: reading.unit,
        severity: reading.status,
        status: reading.status,
        timestamp: new Date(data.timestamp).toLocaleString(),
        allReadings: data.readings.map((r) => ({
          parameter: r.parameter,
          value: r.value,
          unit: r.unit,
          status: r.status,
        })),
      });

      try {
        await sendEmail({
          to: residents.map((r) => ({ email: r.email, name: r.name })),
          subject,
          htmlContent: html,
        });
        
        // Log to Firestore
        await logAlertToFirestore({
          parameter: reading.parameter,
          value: reading.value,
          unit: reading.unit,
          severity: reading.status,
          message: `${reading.parameter} contaminated - ${reading.value} ${reading.unit}`,
        });

        console.info(
          `[AquaMonitor] ✅ Alert email sent & logged: ${alertKey} → ${residents.length} resident(s)`
        );
      } catch (err) {
        // Reset cooldown so it retries on next poll cycle
        console.error(`[AquaMonitor] ❌ Failed to send alert (${alertKey}):`, err);
      }
    });
    }

    processAlerts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt]); // trigger on each new fetch, not just data reference change
}
