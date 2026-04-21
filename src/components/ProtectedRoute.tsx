// ProtectedRoute — redirects unauthenticated users to the login page
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Droplets, Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show a full-screen loader while Firebase resolves auth state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center water-bg gap-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 glow-primary">
          <Droplets className="w-8 h-8 text-primary" />
        </div>
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Verifying your session...</p>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
