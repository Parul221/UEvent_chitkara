import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import BackButton from "../components/BackButton";
import { User, Mail, ShieldAlert, GraduationCap, MapPin, Layers, Award } from "lucide-react";

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMember() {
      try {
        const res = await fetch(`${API_BASE}/api/members/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Member not found");
        setMember(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [id]);

  return (
    <div className="min-h-screen bg-black text-white p-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <BackButton className="fixed left-6 top-6 z-50" />

      <section className="w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 animate-scale-up relative z-10">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Loading member profile...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <ShieldAlert size={40} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-400 font-bold">{error}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                {member.name?.slice(0, 1).toUpperCase() || "M"}
              </div>
              <div>
                <span className="text-[9px] text-red-400 font-extrabold uppercase tracking-widest bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">
                  {member.role || "Member"}
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase mt-2">{member.name}</h1>
                <p className="text-slate-400 text-xs mt-0.5 font-semibold">Registered Team Member</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <InfoRow icon={<Mail size={16} className="text-red-500" />} label="Email Address" value={member.email} />
              <InfoRow icon={<Award size={16} className="text-red-500" />} label="Roll Number" value={member.meta?.rollNo} />
              <InfoRow icon={<Layers size={16} className="text-red-500" />} label="Department" value={member.meta?.department} />
              <InfoRow icon={<MapPin size={16} className="text-red-500" />} label="Residence status" value={member.meta?.status} />
              <InfoRow icon={<GraduationCap size={16} className="text-red-500" />} label="Academic Year" value={member.meta?.year ? `${member.meta.year} Year` : ""} />
              <InfoRow icon={<User size={16} className="text-red-500" />} label="Branch Specialist" value={member.meta?.branch} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="border border-white/5 bg-white/5 rounded-2xl p-4 flex items-start gap-3.5 hover:border-white/10 transition duration-300">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</div>
        <div className="text-xs text-slate-200 mt-1 font-semibold">{value || "—"}</div>
      </div>
    </div>
  );
}
