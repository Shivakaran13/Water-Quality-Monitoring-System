import { useCurrentReadings } from "@/hooks/useThingSpeak";
import { useAlertMonitor } from "@/hooks/useAlertMonitor";
import SensorCard from "@/components/dashboard/SensorCard";
import ChartSection from "@/components/dashboard/ChartSection";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import PredictionCard from "@/components/dashboard/PredictionCard";
import { Download, RefreshCw, Loader2 } from "lucide-react";

const Dashboard = () => {
  const { data, isLoading, isError, refetch } = useCurrentReadings();
  useAlertMonitor(); // 🔔 Auto-sends email alerts when readings are warning/critical

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time water quality monitoring
            {data?.timestamp && (
              <span className="ml-2 text-xs opacity-70">
                • Last update: {new Date(data.timestamp).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all text-sm font-medium shadow-md">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel rounded-2xl p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="ml-3 text-muted-foreground">Fetching sensor data from ThingSpeak...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="glass-panel rounded-2xl p-6 border-destructive/30 border">
          <p className="text-destructive font-medium">Failed to fetch sensor data</p>
          <p className="text-sm text-muted-foreground mt-1">Please check your internet connection and try again.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:brightness-110 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Sensor Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.readings.map((reading, idx) => (
            <SensorCard key={reading.parameter} reading={reading} index={idx} />
          ))}
        </div>
      )}

      {/* Charts */}
      <ChartSection />

      {/* Alerts + Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AlertsPanel />
        </div>
        <PredictionCard />
      </div>
    </div>
  );
};

export default Dashboard;
