// AquaMonitor — Auto-Alert Email Server
// ═══════════════════════════════════════════════════════════════════
// Polls ThingSpeak every 15 seconds. If any sensor is WARNING or
// CRITICAL, auto-sends emails to all registered residents.
// Also exposes HTTP endpoints for the React app (manual test + resident sync).
//
// Start: node email-server.js   (keep running in a separate terminal)
// ═══════════════════════════════════════════════════════════════════

import express from "express";
import cors    from "cors";
import nodemailer from "nodemailer";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Gmail credentials ───────────────────────────────────────────────────────
const GMAIL_USER         = "13shivakaran@gmail.com";
const GMAIL_APP_PASSWORD = "tdqy okqr uekg zuei";   // App Password (16 chars)

// ─── ThingSpeak channel ──────────────────────────────────────────────────────
// field1 = pH (raw)  field2 = Turbidity (raw)  field3 = Temp °C  field4 = TDS ppm
const CHANNEL_ID       = "3350134";
const POLL_INTERVAL_MS = 15_000;          // 15 seconds

// ─── Alert cooldown (per parameter+severity) ────────────────────────────────
const COOLDOWN_MS = 30 * 60 * 1_000;     // 30 minutes
const cooldowns   = {};                   // { "TDS_critical": timestamp }

function canAlert(key) {
  const t = cooldowns[key];
  return !t || Date.now() - t > COOLDOWN_MS;
}
function markAlert(key) { cooldowns[key] = Date.now(); }

// ─── Residents file ──────────────────────────────────────────────────────────
const RESIDENTS_FILE = path.join(__dirname, "residents.json");

function loadResidents() {
  try {
    if (!fs.existsSync(RESIDENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(RESIDENTS_FILE, "utf8"));
  } catch { return []; }
}

function saveResidentsFile(list) {
  fs.writeFileSync(RESIDENTS_FILE, JSON.stringify(list, null, 2));
}

// ─── Nodemailer transporter ──────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
});

// ─── Sensor calibration (mirrors thingspeakApi.ts) ──────────────────────────
function calibratePH(raw) {
  const c = 7.0 + (raw - 7.0) * 0.15;
  return Math.max(0, Math.min(14, c));
}

function calibrateTurbidity(raw) {
  const ntu = (1000 - raw) / 100;
  const cl  = Math.max(0, ntu);
  return (cl < 0.1 || cl > 4.0) ? 1.0 : parseFloat(cl.toFixed(1));
}

// ─── Status thresholds ───────────────────────────────────────────────────────
function getStatus(param, v) {
  if (param === "pH Level")    return v >= 6.5 && v <= 8.5 ? "safe" : v >= 5.5 && v <= 9.5 ? "warning" : "critical";
  if (param === "Turbidity")   return v < 5 ? "safe" : v < 10 ? "warning" : "critical";
  if (param === "Temperature") return v >= 15 && v <= 35 ? "safe" : v >= 10 && v <= 40 ? "warning" : "critical";
  if (param === "TDS")         return v < 500 ? "safe" : v < 1000 ? "warning" : "critical";
  return "safe";
}

// ─── HTML email builder ──────────────────────────────────────────────────────
function buildHtml(triggered, allReadings, timestamp) {
  const isCrit = triggered.status === "critical";
  const color  = isCrit ? "#e53e3e" : "#d97706";

  const rows = allReadings.map(r => {
    const sc = r.status === "safe" ? "#38a169" : r.status === "warning" ? "#d97706" : "#e53e3e";
    return `<tr>
      <td style="padding:10px 16px;font-size:13px;color:#4a5568;border-bottom:1px solid #e2e8f0;">${r.parameter}</td>
      <td style="padding:10px 16px;font-size:13px;font-weight:700;font-family:monospace;color:#1a202c;border-bottom:1px solid #e2e8f0;">${r.value} ${r.unit}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
        <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;background:${sc}20;color:${sc};">
          ${r.status}
        </span>
      </td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" style="background:#eef2f7;padding:40px 0;"><tr><td align="center">
<table width="600" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.1);">
  <tr><td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:32px 40px;text-align:center;">
    <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:1px;">💧 AquaMonitor</div>
    <p style="margin:8px 0 0;font-size:12px;color:#93c5fd;text-transform:uppercase;letter-spacing:1px;">Water Quality Monitoring System</p>
  </td></tr>

  <tr><td style="background:${color}15;border-left:5px solid ${color};padding:20px 40px;">
    <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${color};">
      ${isCrit ? "🚨 Critical Alert" : "⚠️ Warning Alert"}
    </p>
    <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#1a202c;">${triggered.parameter} Contamination Detected</p>
    <p style="margin:4px 0 0;font-size:13px;color:#718096;">Detected at ${timestamp}</p>
  </td></tr>

  <tr><td style="padding:28px 40px 16px;">
    <p style="margin:0 0 14px;font-size:14px;color:#4a5568;line-height:1.6;">
      Dear Resident, our IoT sensors have detected an abnormal <strong>${triggered.status}</strong>
      reading in your water supply.
      ${isCrit ? "<strong>Immediate action required.</strong>" : "Please monitor the situation closely."}
    </p>
    <table width="100%" style="background:${color}10;border:2px solid ${color}30;border-radius:12px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:${color};font-weight:700;">Triggered Parameter</p>
        <p style="margin:8px 0 0;font-size:36px;font-weight:900;font-family:monospace;color:#1a202c;">
          ${triggered.value} <span style="font-size:18px;font-weight:400;color:#718096;">${triggered.unit}</span>
        </p>
        <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:${color};">
          ${triggered.parameter} — ${triggered.status.toUpperCase()}
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:16px 40px 24px;">
    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a202c;">All Sensor Readings</p>
    <table width="100%" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <thead><tr style="background:#f7fafc;">
        <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#718096;">Parameter</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#718096;">Value</th>
        <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#718096;">Status</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </td></tr>

  <tr><td style="padding:0 40px 32px;">
    <table width="100%" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">📋 Advisory</p>
        <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.8;">
          ${isCrit
            ? "<li>Do NOT drink tap water until further notice</li><li>Use bottled water for drinking and cooking</li><li>Contact your local water authority immediately</li>"
            : "<li>Consider using filtered water</li><li>Monitor updates on the AquaMonitor dashboard</li>"}
          <li>Stay informed — more updates will be sent if the situation changes</li>
        </ul>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#f7fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;font-size:12px;color:#a0aec0;">
      Automated alert from <strong>AquaMonitor IoT</strong>.<br/>
      You are registered as a resident on this monitoring zone.
    </p>
    <p style="margin:8px 0 0;font-size:11px;color:#cbd5e0;">© 2026 AquaMonitor — Smart Water Quality Monitoring</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ─── Send alert email to all residents ──────────────────────────────────────
async function sendAlertToResidents(triggered, allReadings, timestamp) {
  const residents = loadResidents();
  if (!residents.length) {
    console.log("  ⚠️  No residents registered — add them via Settings page.");
    return;
  }

  const to      = residents.map(r => `"${r.name}" <${r.email}>`).join(", ");
  const subject = triggered.status === "critical"
    ? `🚨 CRITICAL: ${triggered.parameter} contamination detected — AquaMonitor`
    : `⚠️ WARNING: ${triggered.parameter} alert — AquaMonitor`;

  try {
    await transporter.sendMail({
      from: `"AquaMonitor Alerts" <${GMAIL_USER}>`,
      to,
      subject,
      html: buildHtml(triggered, allReadings, timestamp),
    });
    console.log(`  ✅ Email sent (${triggered.status}) → ${residents.map(r => r.email).join(", ")}`);
  } catch (err) {
    console.error(`  ❌ Email failed: ${err.message}`);
  }
}

// ─── ThingSpeak auto-poll ────────────────────────────────────────────────────
async function pollThingSpeak() {
  try {
    const url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=1`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const feed = json.feeds?.[0];
    if (!feed) return;

    const ts   = new Date(feed.created_at).toLocaleString();
    const ph   = calibratePH(parseFloat(feed.field1 || "7"));
    const turb = calibrateTurbidity(parseFloat(feed.field2 || "1000"));
    const temp = parseFloat(feed.field3 || "25");
    const tds  = parseFloat(feed.field4 || "300");

    const readings = [
      { parameter: "Temperature", value: parseFloat(temp.toFixed(1)), unit: "°C",  status: getStatus("Temperature", temp) },
      { parameter: "pH Level",    value: parseFloat(ph.toFixed(2)),   unit: "pH",  status: getStatus("pH Level",    ph)   },
      { parameter: "Turbidity",   value: turb,                        unit: "NTU", status: getStatus("Turbidity",   turb) },
      { parameter: "TDS",         value: parseFloat(tds.toFixed(0)),  unit: "ppm", status: getStatus("TDS",         tds)  },
    ];

    console.log(`[${new Date().toLocaleTimeString()}] Poll → Temp:${temp}°C  pH:${ph.toFixed(2)}  Turb:${turb}NTU  TDS:${tds}ppm`);

    for (const r of readings) {
      if (r.status === "safe") continue;

      const key = `${r.parameter}_${r.status}`;
      if (!canAlert(key)) {
        const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - cooldowns[key])) / 60000);
        console.log(`  ⏳ ${r.parameter} (${r.status}) — cooldown: ${remaining}m remaining`);
        continue;
      }

      console.log(`  🔔 ALERT: ${r.parameter} = ${r.value} ${r.unit} [${r.status.toUpperCase()}]`);
      markAlert(key);
      await sendAlertToResidents(r, readings, ts);
    }
  } catch (err) {
    console.error(`[Poll error] ${err.message}`);
  }
}

// ─── Express app ─────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

// Manual email (from React app "Send Test Email" button)
app.post("/api/send-email", async (req, res) => {
  const { to, subject, htmlContent } = req.body;
  if (!to?.length || !subject || !htmlContent)
    return res.status(400).json({ error: "to, subject, and htmlContent are required" });

  try {
    const recipients = to.map(r => `"${r.name || r.email}" <${r.email}>`).join(", ");
    await transporter.sendMail({
      from: `"AquaMonitor Alerts" <${GMAIL_USER}>`,
      to: recipients,
      subject,
      html: htmlContent,
    });
    console.log(`✅ Manual email sent → ${recipients}`);
    res.json({ success: true });
  } catch (err) {
    console.error(`❌ Manual email failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Sync resident list from React app Settings page
app.get("/api/residents", (_, res) => res.json(loadResidents()));

app.post("/api/residents", (req, res) => {
  if (!Array.isArray(req.body))
    return res.status(400).json({ error: "Expected an array" });
  saveResidentsFile(req.body);
  console.log(`👥 Residents updated: ${req.body.length} registered — ${req.body.map(r => r.email).join(", ")}`);
  res.json({ success: true, count: req.body.length });
});

// Health check
app.get("/api/health", (_, res) =>
  res.json({ status: "ok", residents: loadResidents().length, gmail: GMAIL_USER })
);

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, async () => {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║      AquaMonitor Auto-Alert Email Server             ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`📡 Server  : http://localhost:${PORT}`);
  console.log(`📧 Gmail   : ${GMAIL_USER}`);
  console.log(`👥 Residents: ${loadResidents().length} registered`);
  console.log(`⏱  Polling ThingSpeak channel ${CHANNEL_ID} every ${POLL_INTERVAL_MS / 1000}s`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Run first poll immediately, then every 15s
  await pollThingSpeak();
  setInterval(pollThingSpeak, POLL_INTERVAL_MS);
});
