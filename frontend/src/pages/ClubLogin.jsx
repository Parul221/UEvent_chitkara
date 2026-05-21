import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import BackButton from "../components/BackButton";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

const ClubLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/club-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Save JWT and club info to localStorage
      localStorage.setItem("clubToken", data.token);
      localStorage.setItem("clubInfo", JSON.stringify(data.club));

      // Redirect to Club Dashboard
      navigate("/club-dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <BackButton className="fixed left-6 top-6 z-50" />
      
      <div className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative z-10 animate-scale-up">
        <div className="text-center mb-8">
          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Club Portal</span>
          <h2 className="text-3xl font-black mt-3 tracking-tight uppercase text-white">
            Club Login
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Campus Event Coordinator Hub</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Club Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-500" size={16} />
              <input
                required
                type="email"
                placeholder="club@university.com"
                className="glass-input rounded-xl pl-10 pr-4 py-3 w-full text-xs text-white border border-white/10 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-slate-500" size={16} />
              <input
                required
                type="password"
                placeholder="Enter password"
                className="glass-input rounded-xl pl-10 pr-4 py-3 w-full text-xs text-white border border-white/10 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 glass-button rounded-xl py-3.5 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Verifying Credentials...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 space-y-3.5 text-center text-xs">
          <p className="text-slate-400">
            Need an account?{" "}
            <Link
              to="/club-register"
              className="text-white hover:text-red-400 font-bold transition-colors"
            >
              Register Club
            </Link>
          </p>
          <p className="text-slate-500">
            Are you a student?{" "}
            <Link
              to="/login"
              className="text-white hover:text-red-400 font-bold transition-colors"
            >
              Student Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubLogin;
