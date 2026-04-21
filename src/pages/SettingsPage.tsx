import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Wifi,
  Mail,
  PlusCircle,
  Trash2,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import {
  sendEmail,
  type Resident,
} from "@/lib/brevoApi";
import { buildAlertEmailHtml } from "@/lib/emailTemplates";
import { useCurrentReadings } from "@/hooks/useThingSpeak";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  getResidentsFromFirestore,
  addResidentToFirestore,
  removeResidentFromFirestore,
  type UserProfile
} from "@/lib/firestore";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [emailReports, setEmailReports] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  // Resident email management
  const [residents, setResidents] = useState<Resident[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");

  // Test email state
  const [testStatus, setTestStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  const { data: sensorData } = useCurrentReadings();

  // Auth / Profile state
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    displayName: "Admin User",
    email: "admin@aquamonitor.io",
    role: "Administrator",
    stationName: "Station Alpha",
    preferences: {
      notifications: true,
      criticalAlerts: true,
      emailReports: false,
      autoSync: true,
    }
  });

  // Load residents & profile from Firestore on mount
  useEffect(() => {
    async function loadData() {
      try {
        const fetchedResidents = await getResidentsFromFirestore();
        setResidents(fetchedResidents);

        if (user?.uid) {
          const fbProfile = await getUserProfile(user.uid);
          if (fbProfile) {
            setProfile(fbProfile);
            setNotifications(fbProfile.preferences.notifications ?? true);
            setCriticalAlerts(fbProfile.preferences.criticalAlerts ?? true);
            setEmailReports(fbProfile.preferences.emailReports ?? false);
            setAutoSync(fbProfile.preferences.autoSync ?? true);
          } else {
            // First time login - set basic info
            setProfile(prev => ({
              ...prev,
              displayName: user.displayName || prev.displayName,
              email: user.email || prev.email,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load data from Firestore:", err);
      }
    }
    loadData();
  }, [user]);

  // Sync to local Express proxy for autonomous alerts
  const syncToLocalProxy = async (updatedResidents: Resident[]) => {
    try {
      const URL = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/api/residents`
        : "http://localhost:3001/api/residents";
      await fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedResidents),
      });
    } catch {
      // ignore
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm"
      />
    </button>
  );

  // Add resident
  const handleAddResident = async () => {
    setAddError("");
    if (!newName.trim()) { setAddError("Name is required."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) { setAddError("Enter a valid email address."); return; }
    if (residents.some((r) => r.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setAddError("This email is already registered."); return;
    }

    try {
      // Save to Firestore
      const newRes = await addResidentToFirestore(newName.trim(), newEmail.trim());
      const updated = [...residents, newRes];
      setResidents(updated);
      syncToLocalProxy(updated); // Sync to background Express server
      
      setNewName("");
      setNewEmail("");
    } catch (err: unknown) {
      setAddError("Failed to add resident to Firestore.");
      console.error(err);
    }
  };

  // Remove resident
  const handleRemove = async (id: string) => {
    try {
      // Remove from Firestore
      await removeResidentFromFirestore(id);
      const updated = residents.filter((r) => r.id !== id);
      setResidents(updated);
      syncToLocalProxy(updated);
    } catch (err: unknown) {
      console.error("Failed to remove resident:", err);
    }
  };

  // Send a live test alert email to all residents
  const handleTestEmail = async () => {
    if (residents.length === 0) {
      setTestMessage("Add at least one resident first.");
      setTestStatus("error");
      return;
    }
    setTestStatus("sending");
    setTestMessage("");

    const allReadings = sensorData?.readings.map((r) => ({
      parameter: r.parameter,
      value: r.value,
      unit: r.unit,
      status: r.status,
    })) ?? [
      { parameter: "Temperature", value: 28.5, unit: "°C", status: "safe" },
      { parameter: "pH Level", value: 7.2, unit: "pH", status: "safe" },
      { parameter: "Turbidity", value: 1.0, unit: "NTU", status: "safe" },
      { parameter: "TDS", value: 380, unit: "ppm", status: "safe" },
    ];

    const html = buildAlertEmailHtml({
      parameter: "TEST — Water Quality",
      value: 0,
      unit: "",
      severity: "warning",
      status: "warning",
      timestamp: new Date().toLocaleString(),
      allReadings,
    });

    try {
      await sendEmail({
        to: residents.map((r) => ({ email: r.email, name: r.name })),
        subject: "🧪 TEST: AquaMonitor Alert System — Email Delivery Test",
        htmlContent: html,
      });
      setTestStatus("success");
      setTestMessage(`Test email sent to ${residents.length} resident(s) successfully!`);
    } catch (err: unknown) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Failed to send test email.");
    }

    // Reset after 6 seconds
    setTimeout(() => { setTestStatus("idle"); setTestMessage(""); }, 6000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" />
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">Manage your system preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Profile</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground">Name</label>
            <input 
              value={profile.displayName || ""} 
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" 
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Email</label>
            <input 
              value={profile.email || ""} 
              disabled // usually emails aren't editable here, or rely on Firebase Auth
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted border border-border/50 text-muted-foreground text-sm" 
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Role</label>
            <input 
              value={profile.role || "Administrator"} 
              disabled className="w-full mt-1 px-4 py-2.5 rounded-xl bg-muted border border-border/50 text-muted-foreground text-sm" 
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Station</label>
            <input 
              value={profile.stationName || ""} 
              onChange={(e) => setProfile({ ...profile, stationName: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" 
            />
          </div>
        </div>
      </motion.div>

      {/* Resident Email Alerts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Resident Email Alerts</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            {residents.length} registered
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-5 ml-8">
          All residents below will receive an automated email when water quality reaches <strong>warning</strong> or <strong>critical</strong> levels.
        </p>

        {/* Add Resident Form */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Resident Name"
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Email Address"
            type="email"
            className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            onKeyDown={(e) => e.key === "Enter" && handleAddResident()}
          />
          <button
            onClick={handleAddResident}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            Add
          </button>
        </div>

        {addError && (
          <p className="text-xs text-destructive mb-3 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> {addError}
          </p>
        )}

        {/* Resident List */}
        <div className="space-y-2 mb-5 max-h-60 overflow-y-auto pr-1">
          <AnimatePresence>
            {residents.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed border-border/50 rounded-xl"
              >
                No residents registered yet. Add emails above.
              </motion.p>
            ) : (
              residents.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40 border border-border/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(r.id)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove resident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Test Email Button */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/30">
          <button
            onClick={handleTestEmail}
            disabled={testStatus === "sending"}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 border border-accent/30 text-accent-foreground text-sm font-semibold hover:bg-accent/25 transition-all disabled:opacity-50"
          >
            {testStatus === "sending" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {testStatus === "sending" ? "Sending..." : "Send Test Email"}
          </button>

          <AnimatePresence>
            {testMessage && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className={`flex items-center gap-1.5 text-xs font-medium ${testStatus === "success" ? "text-success" : "text-destructive"}`}
              >
                {testStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {testMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { label: "Push Notifications", desc: "Receive alerts in browser", value: notifications, onChange: setNotifications },
            { label: "Critical Alerts Email", desc: "Auto-email residents on critical readings", value: criticalAlerts, onChange: setCriticalAlerts },
            { label: "Weekly Email Reports", desc: "Get weekly summary via email", value: emailReports, onChange: setEmailReports },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Toggle value={item.value} onChange={item.onChange} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* System */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wifi className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">System</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Sync</p>
              <p className="text-xs text-muted-foreground">Sync sensor data automatically</p>
            </div>
            <Toggle value={autoSync} onChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Sampling Interval</p>
              <p className="text-xs text-muted-foreground">How often to read sensor data</p>
            </div>
            <select className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
              <option>5 seconds</option>
              <option>10 seconds</option>
              <option>30 seconds</option>
              <option>1 minute</option>
            </select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Firmware Version</p>
              <p className="text-xs text-muted-foreground">Current IoT firmware</p>
            </div>
            <span className="text-sm font-mono text-muted-foreground">v2.4.1</span>
          </div>
        </div>
      </motion.div>

      {/* Save */}
      <div className="flex justify-end">
        <button 
          onClick={async () => {
            if (user?.uid) {
              await updateUserProfile(user.uid, {
                ...profile,
                preferences: { notifications, criticalAlerts, emailReports, autoSync }
              });
              alert("Settings successfully saved to Firestore!");
            }
          }}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:brightness-110 transition-all shadow-md"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
