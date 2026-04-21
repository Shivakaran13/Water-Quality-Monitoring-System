import { motion } from "framer-motion";
import { Activity, Zap, Waves, Thermometer, Droplet, Loader2 } from "lucide-react";
import { useCurrentReadings, useHistoryData } from "@/hooks/useThingSpeak";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const LiveMonitor = () => {
  const { data: currentData, isLoading: loadingCurrent } = useCurrentReadings();
  const { data: historyData, isLoading: loadingHistory } = useHistoryData(20);

  const isLoading = loadingCurrent || loadingHistory;

  // Map parameter names to data keys for sparklines
  const paramKeyMap: Record<string, string> = {
    Temperature: "temperature",
    "pH Level": "ph",
    Turbidity: "turbidity",
    TDS: "tds",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Live Monitor
        </h1>
        <p className="text-sm text-muted-foreground">Real-time sensor readings from ThingSpeak (auto-refresh every 15s)</p>
      </div>

      {isLoading && (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading sensor data...</span>
        </div>
      )}

      {/* Live readings grid */}
      {currentData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentData.readings.map((reading, idx) => (
            <motion.div
              key={reading.parameter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{reading.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{reading.parameter}</h3>
                    <p className="text-xs text-muted-foreground">
                      Updated: {new Date(currentData.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${reading.status === "safe" ? "bg-success/10" : reading.status === "warning" ? "bg-warning/10" : "bg-destructive/10"
                  }`}>
                  <div className={`w-3 h-3 rounded-full ${reading.status === "safe" ? "bg-success" : reading.status === "warning" ? "bg-warning" : "bg-destructive"
                    }`} />
                  <div className={`absolute inset-0 rounded-full animate-ripple ${reading.status === "safe" ? "bg-success/20" : reading.status === "warning" ? "bg-warning/20" : "bg-destructive/20"
                    }`} />
                </div>
              </div>

              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-bold font-mono text-foreground">{reading.value}</span>
                <span className="text-lg text-muted-foreground mb-1">{reading.unit}</span>
              </div>

              {/* Mini sparkline */}
              {historyData && historyData.length > 1 && (
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData}>
                      <Line
                        type="monotone"
                        dataKey={paramKeyMap[reading.parameter] || "temperature"}
                        stroke="hsl(205 85% 45%)"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* System vitals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">System Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Uptime", value: "99.7%", icon: Zap },
            { label: "Data Points", value: historyData ? `${historyData.length}` : "...", icon: Waves },
            { label: "Sensors Active", value: "4/4", icon: Thermometer },
            {
              label: "Last Sync",
              value: currentData ? new Date(currentData.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "...",
              icon: Droplet,
            },
          ].map((item) => (
            <div key={item.label} className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
              <item.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold font-mono text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LiveMonitor;
