import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useHistoryData, useStatsData } from "@/hooks/useThingSpeak";
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const Analytics = () => {
  const { data: historyData, isLoading: loadingHistory } = useHistoryData(100);
  const { data: statsData, isLoading: loadingStats } = useStatsData(100);

  const isLoading = loadingHistory || loadingStats;

  const statCards = statsData
    ? [
      { label: "Avg Temperature", current: statsData.avg.temperature, previous: statsData.previousAvg.temperature, unit: "°C", min: statsData.minMax.temperature.min, max: statsData.minMax.temperature.max },
      { label: "Avg pH Level", current: statsData.avg.ph, previous: statsData.previousAvg.ph, unit: "pH", min: statsData.minMax.ph.min, max: statsData.minMax.ph.max },
      { label: "Avg Turbidity", current: statsData.avg.turbidity, previous: statsData.previousAvg.turbidity, unit: "NTU", min: statsData.minMax.turbidity.min, max: statsData.minMax.turbidity.max },
      { label: "Avg TDS", current: statsData.avg.tds, previous: statsData.previousAvg.tds, unit: "ppm", min: statsData.minMax.tds.min, max: statsData.minMax.tds.max },
    ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Statistical analysis from {statsData ? `${statsData.totalReadings} readings` : "ThingSpeak data"}
        </p>
      </div>

      {isLoading && (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Loading analytics data...</span>
        </div>
      )}

      {/* Stat summary cards */}
      {statsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const diff = stat.previous !== 0
              ? (((stat.current - stat.previous) / stat.previous) * 100).toFixed(1)
              : "0.0";
            const isUp = Number(diff) > 0;
            const TrendIcon = isUp ? TrendingUp : Number(diff) < 0 ? TrendingDown : Minus;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel rounded-2xl p-5"
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold font-mono text-foreground">{stat.current}</span>
                    <span className="text-sm text-muted-foreground ml-1">{stat.unit}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${isUp ? "text-warning" : "text-success"}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    <span>{diff}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span>Min: {stat.min} {stat.unit}</span>
                  <span>Max: {stat.max} {stat.unit}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-primary/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((stat.current - stat.min) / (stat.max - stat.min || 1)) * 100, 100)}%` }}
                    transition={{ delay: idx * 0.1 + 0.3, duration: 0.8 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Temperature Trend - Area chart */}
      {historyData && historyData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Temperature Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(205 85% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(205 85% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 30% 86%)" />
                <XAxis dataKey="time" stroke="hsl(210 15% 46%)" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(210 15% 46%)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(210 60% 98%)", border: "1px solid hsl(210 30% 86%)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="temperature" stroke="hsl(205, 85%, 45%)" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* TDS Distribution - Bar chart */}
      {historyData && historyData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">TDS Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData.filter((_, i) => i % 3 === 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 30% 86%)" />
                <XAxis dataKey="time" stroke="hsl(210 15% 46%)" tick={{ fontSize: 11 }} />
                <YAxis stroke="hsl(210 15% 46%)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(210 60% 98%)", border: "1px solid hsl(210 30% 86%)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="tds" fill="hsl(195, 80%, 42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
