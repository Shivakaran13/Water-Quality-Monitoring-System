import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SensorReading } from "@/lib/mockData";

interface SensorCardProps {
  reading: SensorReading;
  index: number;
}

const SensorCard = ({ reading, index }: SensorCardProps) => {
  const statusConfig = {
    safe: { glow: "glow-success", color: "text-success", border: "border-success/20" },
    warning: { glow: "glow-warning", color: "text-warning", border: "border-warning/20" },
    critical: { glow: "glow-destructive", color: "text-destructive", border: "border-destructive/20" },
  };

  const config = statusConfig[reading.status];

  const TrendIcon = reading.trend === "up" ? TrendingUp : reading.trend === "down" ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-panel rounded-2xl p-5 ${config.glow} ${config.border} border`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm text-muted-foreground">{reading.parameter}</p>
          <span className="text-2xl">{reading.icon}</span>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            reading.status === "safe"
              ? "bg-success/10 text-success"
              : reading.status === "warning"
              ? "bg-warning/10 text-warning"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {reading.status === "safe" ? "Safe" : reading.status === "warning" ? "Warning" : "Critical"}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-foreground font-mono">{reading.value}</span>
          <span className="text-sm text-muted-foreground ml-1">{reading.unit}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs ${config.color}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{reading.trendValue > 0 ? "+" : ""}{reading.trendValue}</span>
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((reading.value - reading.min) / (reading.max - reading.min)) * 100}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            reading.status === "safe"
              ? "bg-success"
              : reading.status === "warning"
              ? "bg-warning"
              : "bg-destructive"
          }`}
        />
      </div>
    </motion.div>
  );
};

export default SensorCard;
