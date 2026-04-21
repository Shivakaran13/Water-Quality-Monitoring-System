import { useState } from "react";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useHistoryData } from "@/hooks/useThingSpeak";
import { Loader2 } from "lucide-react";

const parameterConfig = {
  temperature: { color: "#f97316", label: "Temperature (°C)" },
  ph: { color: "#22d3ee", label: "pH Level" },
  turbidity: { color: "#a78bfa", label: "Turbidity (NTU)" },
  tds: { color: "#34d399", label: "TDS (ppm)" },
};

const ChartSection = () => {
  const [activeParam, setActiveParam] = useState<keyof typeof parameterConfig>("temperature");
  const { data, isLoading } = useHistoryData(50);
  const config = parameterConfig[activeParam];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">Sensor History</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(parameterConfig).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setActiveParam(key as keyof typeof parameterConfig)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeParam === key
                  ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary"
                }`}
            >
              {cfg.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 sm:h-72">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading chart data...</span>
          </div>
        ) : data && data.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 30% 86%)" />
              <XAxis
                dataKey="time"
                stroke="hsl(210 15% 46%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(210 15% 46%)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(210 60% 98%)",
                  border: "1px solid hsl(210 30% 86%)",
                  borderRadius: "12px",
                  color: "hsl(210 40% 14%)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={activeParam}
                stroke={config.color}
                strokeWidth={2}
                fill="url(#colorGradient)"
                dot={false}
                activeDot={{ r: 4, fill: config.color }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            Not enough data points yet
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChartSection;
