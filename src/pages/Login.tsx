import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Droplets, Mail, Lock, Eye, EyeOff, User, AlertCircle, Chrome } from "lucide-react";
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  resetPassword,
} from "@/lib/firebase";

type Mode = "login" | "register" | "reset";

const Login = () => {
  const [mode, setMode]               = useState<Mode>("login");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]             = useState("");
  const [successMsg, setSuccessMsg]   = useState("");
  const navigate = useNavigate();

  const clearState = () => { setError(""); setSuccessMsg(""); };

  // Friendly Firebase error messages
  function friendlyError(code: string): string {
    const map: Record<string, string> = {
      "auth/invalid-email":          "Invalid email address format.",
      "auth/user-not-found":         "No account found with this email.",
      "auth/wrong-password":         "Incorrect password. Try again.",
      "auth/email-already-in-use":   "An account already exists with this email.",
      "auth/weak-password":          "Password must be at least 6 characters.",
      "auth/too-many-requests":      "Too many failed attempts. Try again later.",
      "auth/popup-closed-by-user":   "Google sign-in was cancelled.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/invalid-credential":     "Invalid email or password.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  }

  // Email / Password submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();
    setIsLoading(true);

    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        navigate("/dashboard");
      } else if (mode === "register") {
        await registerWithEmail(email, password);
        navigate("/dashboard");
      } else if (mode === "reset") {
        await resetPassword(email);
        setSuccessMsg("Password reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogle = async () => {
    clearState();
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const titles: Record<Mode, { heading: string; sub: string; btn: string }> = {
    login:    { heading: "Welcome back",     sub: "Sign in to your account",          btn: "Sign In" },
    register: { heading: "Create account",   sub: "Join AquaMonitor today",           btn: "Create Account" },
    reset:    { heading: "Reset password",   sub: "Enter your email to get a reset link", btn: "Send Reset Link" },
  };

  const t = titles[mode];

  return (
    <div className="min-h-screen flex items-center justify-center water-bg relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 glow-primary">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">AquaMonitor</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Water Quality Monitoring</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-panel-strong rounded-2xl p-8"
        >
          {/* Mode heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-foreground mb-1">{t.heading}</h2>
              <p className="text-muted-foreground text-sm mb-6">{t.sub}</p>
            </motion.div>
          </AnimatePresence>

          {/* Error / Success banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm"
              >
                ✅ {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display name (register only) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-sm font-medium text-foreground">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            {/* Password (not shown in reset mode) */}
            <AnimatePresence>
              {mode !== "reset" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)} required={mode !== "reset"}
                      placeholder="••••••••" minLength={6}
                      className="w-full pl-10 pr-12 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password link (login only) */}
            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setMode("reset"); clearState(); }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <motion.button
              type="submit" disabled={isLoading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold transition-all hover:brightness-110 disabled:opacity-60 glow-primary"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {mode === "login" ? "Signing in..." : mode === "register" ? "Creating account..." : "Sending..."}
                </span>
              ) : t.btn}
            </motion.button>
          </form>

          {/* Google sign-in (login + register only) */}
          {mode !== "reset" && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <motion.button
                type="button" onClick={handleGoogle} disabled={googleLoading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border/60 bg-secondary/40 text-foreground text-sm font-medium hover:bg-secondary/60 transition-all disabled:opacity-60"
              >
                {googleLoading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  <Chrome className="w-4 h-4" />
                )}
                Sign in with Google
              </motion.button>
            </>
          )}

          {/* Mode switcher */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("register"); clearState(); }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Create one
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); clearState(); }}
                  className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          IoT Water Quality Monitoring System v2.0
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
