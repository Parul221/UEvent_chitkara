import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import BackButton from "../components/BackButton";
import { Mail, Lock, User, Sparkles, Loader2, ArrowRight } from "lucide-react";

export default function ClubRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    organizer: "",
    email: "",
    password: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Club name, email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/club-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Club registration failed.");
        return;
      }

      localStorage.setItem("clubToken", data.token);
      localStorage.setItem("clubInfo", JSON.stringify(data.club));
      navigate("/club-dashboard", { replace: true });
    } catch (err) {
      console.error("Club registration error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <BackButton className="fixed left-6 top-6 z-50" />

      <section className="glass-panel p-8 sm:p-10 rounded-3xl w-full max-w-xl border border-white/10 shadow-2xl relative z-10 animate-scale-up">
        <div className="text-center mb-8">
          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Club Directory</span>
          <h1 className="text-3xl font-black mt-3 tracking-tight uppercase text-white">Register Club</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Create a club account to publish campus events.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative flex flex-col gap-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Club Name</label>
              <div className="relative flex items-center">
                <Sparkles className="absolute left-3.5 text-slate-500" size={16} />
                <input
                  required
                  placeholder="e.g. Music Club"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="glass-input rounded-xl pl-10 pr-4 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                />
              </div>
            </div>

            <div className="relative flex flex-col gap-1 w-full">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Organizer Name</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-500" size={16} />
                <input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.organizer}
                  onChange={(e) => setForm((s) => ({ ...s, organizer: e.target.value }))}
                  className="glass-input rounded-xl pl-10 pr-4 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Club Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-slate-500" size={16} />
              <input
                required
                type="email"
                placeholder="clubname@university.com"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                className="glass-input rounded-xl pl-10 pr-4 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
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
                placeholder="Choose a strong password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                className="glass-input rounded-xl pl-10 pr-4 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
              />
            </div>
          </div>

          <div className="relative flex flex-col gap-1 w-full">
            <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Club Description</label>
            <textarea
              placeholder="Describe your club's focus, mission, and typical campus events..."
              rows="4"
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              className="glass-input rounded-xl px-4 py-3 w-full text-xs text-white border border-white/10 focus:border-red-500/50 outline-none resize-none"
            />
          </div>

          <button
            disabled={loading}
            className="w-full mt-6 glass-button rounded-xl py-3.5 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Creating Club Portal...
              </>
            ) : (
              <>
                Register Club
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-xs">
          Already registered?{" "}
          <Link className="text-white hover:text-red-400 font-bold transition-colors" to="/club-login">
            Login here
          </Link>
        </p>
      </section>
    </div>
  );
}
