// AquaMonitor Email Service
// Sends via local email-server.js which uses Brevo SMTP relay (nodemailer).
// Make sure email-server.js is running: npm run email-server

// Local email proxy server OR cloud API endpoint if deployed
const EMAIL_SERVER_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/send-email` 
  : "http://localhost:3001/api/send-email";

export const SENDER = {
  name: "AquaMonitor Alerts",
  email: "alerts@aquamonitor.io",
};

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
}

export interface BrevoApiError {
  code: string;
  message: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  let response: Response;
  try {
    response = await fetch(EMAIL_SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });
  } catch {
    throw new Error(
      "Cannot reach the email server. Make sure it is running:\n  Open a new terminal → npm run email-server"
    );
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const err = await response.json();
      errorMsg = err.error || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
}

// --- Resident List (persisted in localStorage) ---

const RESIDENTS_KEY = "aquamonitor_residents";

export interface Resident {
  id: string;
  name: string;
  email: string;
}

export function getResidents(): Resident[] {
  try {
    const raw = localStorage.getItem(RESIDENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Sync resident list to the email server so auto-alerts use the latest list
async function syncResidentsToServer(residents: Resident[]): Promise<void> {
  try {
    const URL = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/residents`
      : "http://localhost:3001/api/residents";
    await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(residents),
    });
  } catch {
    // Server might not be running — silently ignore
  }
}

export function saveResidents(residents: Resident[]): void {
  localStorage.setItem(RESIDENTS_KEY, JSON.stringify(residents));
  syncResidentsToServer(residents); // keep email server in sync
}

// --- Alert Cooldown (prevent email spam) ---
// Stores { [alertKey]: lastSentTimestamp } in localStorage
// alertKey = parameter + severity, e.g. "Temperature_critical"

const COOLDOWN_KEY = "aquamonitor_alert_cooldown";
const COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

export function canSendAlert(alertKey: string): boolean {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    const last = map[alertKey];
    if (!last) return true;
    return Date.now() - last > COOLDOWN_MS;
  } catch {
    return true;
  }
}

export function markAlertSent(alertKey: string): void {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    const map: Record<string, number> = raw ? JSON.parse(raw) : {};
    map[alertKey] = Date.now();
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}
