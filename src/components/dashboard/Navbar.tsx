import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, ChevronDown, Wifi, WifiOff, Menu, User, LogOut } from "lucide-react";
import { locations } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfile, setShowProfile]   = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [showLocations, setShowLocations] = useState(false);
  const isOnline = true;
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 glass-panel-strong border-b border-border/30 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Status */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-destructive" />
          )}
          <span className="text-xs font-medium text-muted-foreground hidden sm:block">
            {isOnline ? "System Online" : "Offline"}
          </span>
        </div>

        {/* Location Selector */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowLocations(!showLocations)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <span className="hidden sm:inline">{selectedLocation.name}</span>
            <span className="sm:hidden">📍</span>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          {showLocations && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 left-0 w-48 glass-panel-strong rounded-xl overflow-hidden"
            >
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocations(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      loc.status === "online" ? "bg-success" : "bg-destructive"
                    }`}
                  />
                  {loc.name}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Time */}
        <div className="hidden md:block text-sm font-mono text-muted-foreground">
          {currentTime.toLocaleTimeString()}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse-glow" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-md object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
              {user?.displayName ?? user?.email?.split("@")[0] ?? "User"}
            </span>
          </button>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-1 right-0 w-52 glass-panel-strong rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.displayName ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
