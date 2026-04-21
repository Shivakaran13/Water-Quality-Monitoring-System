import { motion } from "framer-motion";
import { Brain, TrendingUp, TrendingDown, Minus, Shield, Loader2 } from "lucide-react";
import { useCurrentReadings } from "@/hooks/useThingSpeak";

function computeStability(readings: Array<{ status: string }>): number {
  if (!readings.length) return 100;
  const penalty = readings.reduce((sum, r) => {
    if (r.status === "critical") return sum + 50;
    if (r.status === "warning")  return sum + 25;
    return sum;
  }, 0);
  return Math.max(0, 100 - penalty);
}

function getRiskLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Low",      color: "bg-success/10 text-success" };
  if (score >= 50) return { label: "Medium",   color: "bg-warning/10 text-warning" };
  return             { label: "High",     color: "bg-destructive/10 text-destructive" };
}

function getTrend(status: string, param: string): { icon: typeof TrendingUp; label: string; color: string } {
  if (status === "critical")
    return { icon: TrendingDown, label: "Action needed", color: "text-destructive" };
  if (status === "warning")
    return { icon: TrendingDown, label: "Deteriorating",  color: "text-warning" };
  return       { icon: Minus,       label: "Stable",         color: "text-success" };
}

const PredictionCard = () => {
  const { data, isLoading } = useCurrentReadings();

  const readings = data?.readings ?? [];
  const stabilityScore = computeStability(readings);
  const risk = getRiskLevel(stabilityScore);

  const scoreColor =
    stabilityScore >= 80 ? "text-success" :
    stabilityScore >= 50 ? "text-warning" :
    "text-destructive";

  const barColor =
    stabilityScore >= 80 ? "bg-gradient-to-r from-primary to-success" :
    stabilityScore >= 50 ? "bg-gradient-to-r from-warning to-primary" :
    "bg-gradient-to-r from-destructive to-warning";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.4 }}
      className="glass-panel rounded-2xl p-5 gradient-border"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Quality Score</h3>
          <p className="text-[10px] text-muted-foreground">
            Based on live sensor data
            {isLoading && <span className="ml-1">· updating...</span>}
          </p>
        </div>
        {isLoading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin ml-auto" />}
      </div>

      <div className="space-y-4">
        {/* Stability bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Water Quality Score</span>
            <span className={`text-lg font-bold font-mono ${scoreColor}`}>
              {stabilityScore}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stabilityScore}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
        </div>

        {/* Risk level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Risk Level</span>
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${risk.color}`}>
            {risk.label}
          </span>
        </div>

        {/* Per-parameter trend */}
        <div className="space-y-2 pt-2 border-t border-border/30">
          {readings.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Loading sensor data...</p>
          ) : (
            readings.map((r) => {
              const trend = getTrend(r.status, r.parameter);
              const Icon = trend.icon;
              return (
                <div key={r.parameter} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{r.parameter}</span>
                  <div className={`flex items-center gap-1 font-medium ${trend.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{trend.label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionCard;
