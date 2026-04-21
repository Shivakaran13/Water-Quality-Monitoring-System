import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Filter, AlertTriangle, Info, XCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";
import { useCurrentReadings } from "@/hooks/useThingSpeak";
import type { AlertItem } from "@/lib/mockData";

const severityConfig = {
  low:      { icon: Info,          bg: "bg-primary/10",     text: "text-primary",     badge: "bg-primary/15 text-primary" },
  medium:   { icon: AlertTriangle, bg: "bg-warning/10",     text: "text-warning",     badge: "bg-warning/15 text-warning" },
  high:     { icon: AlertTriangle, bg: "bg-destructive/10", text: "text-destructive", badge: "bg-destructive/15 text-destructive" },
  critical: { icon: XCircle,       bg: "bg-destructive/15", text: "text-destructive", badge: "bg-destructive/20 text-destructive" },
};

const severities  = ["all", "low", "medium", "high", "critical"] as const;
const parameters  = ["all", "Temperature", "pH Level", "Turbidity", "TDS"] as const;

const AlertsPage = () => {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [paramFilter,    setParamFilter]    = useState<string>("all");

  const alerts             = useLiveAlerts();
  const { isLoading, refetch, dataUpdatedAt } = useCurrentReadings();

  const filtered = alerts.filter((a: AlertItem) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (paramFilter    !== "all" && a.parameter !== paramFilter)   return false;
    return true;
  });

  const countBySeverity = (sev: string) => alerts.filter((a: AlertItem) => a.severity === sev).length;
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Live alerts from ThingSpeak sensors
            {dataUpdatedAt && (
              <span className="ml-2 text-xs opacity-70">• Last update: {lastUpdate}</span>
            )}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading banner */}
      {isLoading && alerts.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Fetching live sensor data from ThingSpeak...</span>
        </div>
      )}

      {/* Summary cards */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["critical", "high", "medium", "low"] as const).map((sev) => {
            const count  = countBySeverity(sev);
            const config = severityConfig[sev];
            return (
              <motion.div
                key={sev}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-panel rounded-2xl p-4 text-center cursor-pointer transition-all hover:shadow-lg ${
                  severityFilter === sev ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSeverityFilter(severityFilter === sev ? "all" : sev)}
              >
                <p className={`text-3xl font-bold font-mono ${config.text}`}>{count}</p>
                <p className="text-xs text-muted-foreground capitalize mt-1">{sev}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All clear state */}
      {!isLoading && alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-12 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-success">All Clear</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All sensors are within safe limits. No alerts detected from ThingSpeak.
          </p>
        </motion.div>
      )}

      {/* Filters (show only if there are alerts) */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-wrap items-center gap-1">
            {parameters.map((p) => (
              <button
                key={p}
                onClick={() => setParamFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  paramFilter === p
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {p === "all" ? "All Params" : p}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1 ml-2">
            {severities.filter(s => s !== "all").map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s === severityFilter ? "all" : s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  severityFilter === s
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alert list */}
      <div className="space-y-3">
        {filtered.length === 0 && alerts.length > 0 && (
          <div className="glass-panel rounded-2xl p-8 text-center text-muted-foreground">
            No alerts match your current filters
          </div>
        )}
        <AnimatePresence>
          {filtered.map((alert: AlertItem, idx) => {
            const config = severityConfig[alert.severity];
            const Icon   = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.04 }}
                className={`glass-panel rounded-2xl p-4 flex items-start gap-4 ${
                  alert.severity === "critical" ? "animate-alert-flash" : ""
                }`}
              >
                <div className={`p-2 rounded-xl ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{alert.parameter}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${config.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="font-mono font-semibold text-foreground">
                      {alert.value} {alert.unit}
                    </span>
                    <span>•</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AlertsPage;
