import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BackButton from "../components/BackButton";
import { clearStudentSession, getStoredStudent, saveStudentSession } from "../utils/studentProfile";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getStoredStudent() || {});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        saveStudentSession({ user: res.data.user });
        setProfile(res.data.user || {});
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function saveProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Verify OTP before saving profile changes.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const res = await API.put("/auth/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      saveStudentSession({ user: res.data.user });
      setProfile(res.data.user || {});
      setMessage("Profile saved. Event forms will use this information.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearStudentSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen text-white px-4 py-8">
      <main className="max-w-4xl mx-auto">
        <BackButton className="mb-6" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-red-500">Student Profile</h1>
            <p className="text-slate-400 mt-2">This information is used to auto-fill event registrations.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/events")} className="glass-button-secondary px-4 py-2 rounded-md">
              Browse Events
            </button>
            <button onClick={logout} className="glass-button px-4 py-2 rounded-md">
              Logout
            </button>
          </div>
        </div>

        <section className="mt-8 glass-panel rounded-2xl p-8">
          {loading ? (
            <p className="text-slate-400">Loading profile...</p>
          ) : (
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name" value={profile.name} onChange={(value) => setProfile((s) => ({ ...s, name: value }))} />
              <Field label="Student ID / Roll No" value={profile.userId} onChange={(value) => setProfile((s) => ({ ...s, userId: value }))} />
              <Field label="Email" value={profile.email} disabled />
              <label className="text-sm text-slate-300">
                Department
                <select
                  value={profile.department || "CSE"}
                  onChange={(e) => setProfile((s) => ({ ...s, department: e.target.value }))}
                  className="mt-1 w-full glass-input rounded-md px-3 py-2 text-white"
                >
                  <option value="CSE">CSE</option>
                  <option value="AI">AI</option>
                  <option value="MECHANICAL">MECHANICAL</option>
                  <option value="ELECTRONICS">ELECTRONICS</option>
                </select>
              </label>
              <Field label="Group / Section" value={profile.group} onChange={(value) => setProfile((s) => ({ ...s, group: value }))} />
              <Field label="Semester" value={profile.semester} onChange={(value) => setProfile((s) => ({ ...s, semester: value }))} />
              <Field label="Year" value={profile.year} onChange={(value) => setProfile((s) => ({ ...s, year: value }))} />
              <label className="text-sm text-slate-300">
                Residence
                <select
                  value={profile.residence || "Hosteller"}
                  onChange={(e) => setProfile((s) => ({ ...s, residence: e.target.value }))}
                  className="mt-1 w-full glass-input rounded-md px-3 py-2 text-white"
                >
                  <option>Hosteller</option>
                  <option>Day Scholar</option>
                </select>
              </label>

              {message && <p className="md:col-span-2 text-sm text-red-300">{message}</p>}

              <button disabled={saving} className="md:col-span-2 glass-button py-3 rounded-md font-bold mt-4">
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, value = "", onChange, disabled = false }) {
  return (
    <label className="text-sm text-slate-300">
      {label}
      <input
        disabled={disabled}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full glass-input rounded-md px-3 py-2 text-white disabled:opacity-50"
      />
    </label>
  );
}
