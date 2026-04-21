import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, XCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useLiveAlerts } from "@/hooks/useLiveAlerts";
import { useCurrentReadings } from "@/hooks/useThingSpeak";
import type { AlertItem } from "@/lib/mockData";

const severityConfig = {
  low:      { icon: Info,          bg: "bg-primary/10",     text: "text-primary",     badge: "bg-primary/15 text-primary" },
  medium:   { icon: AlertTriangle, bg: "bg-warning/10",     text: "text-warning",     badge: "bg-warning/15 text-warning" },
  high:     { icon: AlertTriangle, bg: "bg-destructive/10", text: "text-destructive", badge: "bg-destructive/15 text-destructive" },
  critical: { icon: XCircle,       bg: "bg-destructive/15", text: "text-destructive", badge: "bg-destructive/20 text-destructive" },
};

const AlertsPanel = () => {
  const alerts = useLiveAlerts();
  const { isLoading } = useCurrentReadings();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.4 }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/15 text-destructive">
            {alerts.length} alerts
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-success" />
            <p className="text-sm font-medium text-success">All Clear</p>
            <p className="text-xs text-muted-foreground">All sensors are within safe limits</p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert: AlertItem, idx) => {
              const config = severityConfig[alert.severity];
              const Icon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`flex items-start gap-3 p-3 rounded-xl ${config.bg} transition-colors hover:brightness-110 ${
                    alert.severity === "critical" ? "animate-alert-flash" : ""
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-foreground">{alert.parameter}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${config.badge}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="font-mono">{alert.value} {alert.unit}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
