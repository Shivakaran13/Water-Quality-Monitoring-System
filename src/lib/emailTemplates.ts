// Email HTML Templates for Water Quality Alert Notifications

export type AlertSeverity = "warning" | "critical";

interface AlertEmailData {
  parameter: string;
  value: number;
  unit: string;
  severity: AlertSeverity;
  status: string;
  timestamp: string;
  allReadings: { parameter: string; value: number; unit: string; status: string }[];
}

function severityColor(severity: AlertSeverity): string {
  return severity === "critical" ? "#e53e3e" : "#d97706";
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    safe: "#38a169",
    warning: "#d97706",
    critical: "#e53e3e",
  };
  return colors[status] ?? "#718096";
}

export function buildAlertEmailHtml(data: AlertEmailData): string {
  const color = severityColor(data.severity);
  const isCritical = data.severity === "critical";

  const readingRows = data.allReadings
    .map(
      (r) => `
      <tr>
        <td style="padding:10px 16px;font-size:13px;color:#4a5568;border-bottom:1px solid #e2e8f0;">${r.parameter}</td>
        <td style="padding:10px 16px;font-size:13px;font-weight:700;font-family:monospace;color:#1a202c;border-bottom:1px solid #e2e8f0;">${r.value} ${r.unit}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
          <span style="display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;background:${statusBadge(r.status)}20;color:${statusBadge(r.status)};">
            ${r.status}
          </span>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AquaMonitor Alert</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <span style="font-size:28px;">💧</span>
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;">AquaMonitor</span>
              </div>
              <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;letter-spacing:1px;text-transform:uppercase;">Water Quality Monitoring System</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:${color}15;border-left:5px solid ${color};padding:20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:${color};">
                      ${isCritical ? "🚨 Critical Alert" : "⚠️ Warning Alert"}
                    </p>
                    <p style="margin:6px 0 0;font-size:20px;font-weight:800;color:#1a202c;">
                      ${data.parameter} Contamination Detected
                    </p>
                    <p style="margin:4px 0 0;font-size:13px;color:#718096;">
                      Detected at ${data.timestamp}
                    </p>
                  </td>
                  <td align="right" valign="middle" style="min-width:80px;">
                    <span style="display:inline-block;background:${color};color:#fff;border-radius:50%;width:56px;height:56px;font-size:26px;line-height:56px;text-align:center;">
                      ${isCritical ? "🚨" : "⚠️"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Reading -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <p style="margin:0 0 16px;font-size:14px;color:#4a5568;line-height:1.6;">
                Dear Resident, our IoT sensors have detected an abnormal ${data.severity} 
                reading in your water supply. <strong>Immediate attention may be required.</strong>
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:${color}10;border:2px solid ${color}30;border-radius:12px;padding:0;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${color};font-weight:700;">Triggered Parameter</p>
                    <p style="margin:8px 0 0;font-size:36px;font-weight:900;font-family:monospace;color:#1a202c;">
                      ${data.value} <span style="font-size:18px;font-weight:400;color:#718096;">${data.unit}</span>
                    </p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:${color};">
                      ${data.parameter} — ${data.severity.toUpperCase()}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- All Sensor Readings -->
          <tr>
            <td style="padding:16px 40px 32px;">
              <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a202c;">Current Sensor Readings</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <thead>
                  <tr style="background:#f7fafc;">
                    <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#718096;">Parameter</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#718096;">Value</th>
                    <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#718096;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${readingRows}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Advisory -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;padding:0;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#92400e;">📋 Advisory</p>
                    <ul style="margin:8px 0 0;padding-left:18px;font-size:13px;color:#78350f;line-height:1.8;">
                      ${isCritical ? `
                      <li>Avoid drinking tap water until further notice</li>
                      <li>Use bottled water for drinking and cooking</li>
                      <li>Contact your local water authority immediately</li>` : `
                      <li>Monitor the situation closely</li>
                      <li>Consider using filtered water</li>
                      <li>Check updates in the AquaMonitor dashboard</li>`}
                      <li>Stay informed via AquaMonitor alerts</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#a0aec0;">
                This is an automated alert from <strong>AquaMonitor IoT</strong>.<br/>
                You are receiving this because you are registered as a resident on this monitoring zone.
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#cbd5e0;">© 2026 AquaMonitor — Smart Water Quality Monitoring</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}
