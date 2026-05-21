import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import BackButton from "../components/BackButton";
import {
  LayoutDashboard,
  CalendarPlus2,
  CalendarRange,
  Users,
  LogOut,
  Plus,
  Search,
  Trash2,
  Edit3,
  Eye,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  X,
} from "lucide-react";

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    department: "",
    status: "Hosteller",
    year: "",
    branch: "",
    position: "",
  });

  const token = localStorage.getItem("clubToken");
  const clubInfo = JSON.parse(localStorage.getItem("clubInfo") || "{}");

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchMembers error:", err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMembers();
  }, []);

  async function submitForm(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.rollNo.trim()) {
      alert("Name and Roll No are required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: `${form.rollNo}@club.com`,
      role: form.position.trim() || "member",
      meta: {
        rollNo: form.rollNo.trim(),
        department: form.department.trim(),
        status: form.status,
        year: form.year.trim(),
        branch: form.branch.trim(),
      },
    };

    try {
      const endpoint = editingMember
        ? `${API_BASE}/api/members/${editingMember._id}`
        : `${API_BASE}/api/members`;
      const res = await fetch(endpoint, {
        method: editingMember ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        setMembers((prev) =>
          editingMember
            ? prev.map((member) => (member._id === saved._id ? saved : member))
            : [saved, ...prev]
        );
        setShowModal(false);
        setEditingMember(null);
        setForm({
          name: "",
          rollNo: "",
          department: "",
          status: "Hosteller",
          year: "",
          branch: "",
          position: "",
        });
      } else {
        const txt = await res.text().catch(() => "");
        alert("Failed to save member: " + (txt || res.status));
      }
    } catch (err) {
      console.error("submitForm error:", err);
      alert("Network or server error");
    }
  }

  function openCreateModal() {
    setEditingMember(null);
    setForm({
      name: "",
      rollNo: "",
      department: "",
      status: "Hosteller",
      year: "",
      branch: "",
      position: "",
    });
    setShowModal(true);
  }

  function openEditModal(member) {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      rollNo: member.meta?.rollNo || "",
      department: member.meta?.department || "",
      status: member.meta?.status || "Hosteller",
      year: member.meta?.year || "",
      branch: member.meta?.branch || "",
      position: member.role || "",
    });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this member? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/api/members/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m._id !== id));
      } else {
        const txt = await res.text().catch(() => "");
        console.warn("Delete failed:", res.status, txt);
        alert("Failed to delete member");
      }
    } catch (err) {
      console.error("delete error:", err);
      alert("Network error while deleting");
    }
  }

  const filtered = members.filter((m) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (m.name || "").toLowerCase().includes(q) ||
      (m.meta?.rollNo || "").toLowerCase().includes(q) ||
      (m.meta?.department || "").toLowerCase().includes(q) ||
      (m.role || "").toLowerCase().includes(q)
    );
  });

  const clubInitials = useMemo(() => {
    const name = clubInfo.name || "Club Portal";
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  }, [clubInfo]);

  return (
    <div className="min-h-screen flex bg-black text-slate-200 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className={`transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"} bg-[#050508]/80 backdrop-blur-xl border-r border-white/10 p-5 flex flex-col justify-between z-30`}>
        <div>
          {/* Logo & Header info */}
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-black text-white text-base shadow-[0_0_15px_rgba(220,38,38,0.2)]">
              {clubInitials}
            </div>
            {sidebarOpen && (
              <div className="leading-tight animate-fade-in">
                <div className="text-sm font-black text-white truncate max-w-[150px]">{clubInfo.name || "Club Portal"}</div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">{clubInfo.organizer || "Organizer"}</div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-1.5">
            <button
              onClick={() => navigate("/club-dashboard")}
              className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-left font-bold text-xs"
            >
              <LayoutDashboard size={18} className="text-red-500" />
              {sidebarOpen && <span className="animate-fade-in">Dashboard</span>}
            </button>
            
            <button
              onClick={() => navigate("/club-dashboard", { state: { openNew: true } })}
              className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-left font-bold text-xs"
            >
              <CalendarPlus2 size={18} className="text-red-500" />
              {sidebarOpen && <span className="animate-fade-in">Upload Event</span>}
            </button>

            <button
              onClick={() => navigate("/events")}
              className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-left font-bold text-xs"
            >
              <CalendarRange size={18} className="text-red-500" />
              {sidebarOpen && <span className="animate-fade-in">All Events</span>}
            </button>

            <button
              onClick={() => navigate("/members")}
              className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-white bg-white/5 border border-white/5 transition-all duration-200 text-left font-bold text-xs"
            >
              <Users size={18} className="text-red-500" />
              {sidebarOpen && <span className="animate-fade-in">Members</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="space-y-4 pt-5 border-t border-white/5">
          <button
            onClick={() => {
              localStorage.removeItem("clubToken");
              localStorage.removeItem("clubInfo");
              window.location.href = "/club-login";
            }}
            className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all duration-200 text-left font-bold text-xs"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="animate-fade-in">Logout</span>}
          </button>

          <button 
            className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-4 hover:text-slate-300 transition" 
            onClick={() => setSidebarOpen((s) => !s)}
          >
            {sidebarOpen ? "Collapse Sidebar" : "Expand"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <BackButton className="mb-6" />

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 border-b border-white/5 pb-6">
          <div>
            <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Member Directory</span>
            <h1 className="text-3xl font-black mt-3 tracking-tight uppercase text-white">Club Members</h1>
            <p className="text-slate-400 text-xs mt-1">Manage core team members, assign designations, and track rosters.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex items-center flex-1 lg:flex-none">
              <Search size={14} className="absolute left-3.5 text-slate-500" />
              <input
                placeholder="Search members..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full lg:w-60 glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
              />
            </div>
            
            <button
              onClick={openCreateModal}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              Add Member
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Fetching members...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Users size={40} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white">No Members Added</h3>
            <p className="text-slate-500 text-xs mt-1">Start by clicking the Add Member button to append roles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((m) => (
              <div
                key={m._id}
                className="glass-panel border border-white/5 hover:border-red-500/20 rounded-2xl p-5 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold text-white text-base shadow-md group-hover:scale-105 transition-transform duration-200">
                        {m.name ? m.name.slice(0, 1).toUpperCase() : "?"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug group-hover:text-red-500 transition-colors duration-200">{m.name}</h3>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {m.role || "Member"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-white/5 pt-4 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Roll Number</span>
                      <span className="font-semibold text-slate-200">{m.meta?.rollNo || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Department</span>
                      <span className="text-slate-200">{m.meta?.department || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Academic Year</span>
                      <span className="text-slate-200">{m.meta?.year || "—"} Year</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Residence</span>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        m.meta?.status === "Hosteller"
                          ? "bg-red-500/10 border-red-500/25 text-red-400"
                          : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                      }`}>
                        {m.meta?.status || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/members/${m._id}`)}
                      className="px-3 py-1.5 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                      title="View Member details"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => openEditModal(m)}
                      className="p-1.5 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 size={12} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(m._id)}
                    className="p-1.5 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 rounded-xl text-red-400 hover:text-white transition cursor-pointer"
                    title="Delete member"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 animate-scale-up bg-neutral-950 relative max-h-[90vh]">
            {/* Close */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              {editingMember ? "Edit Member" : "New Member"}
            </h3>
            <p className="text-slate-400 text-xs mb-6">Enter academic roll details, department mappings, and club roles.</p>

            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Student Name</label>
                <input
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Roll Number</label>
                  <input
                    required
                    placeholder="e.g. 2110991234"
                    value={form.rollNo}
                    onChange={(e) => setForm((s) => ({ ...s, rollNo: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Department</label>
                  <input
                    placeholder="e.g. CSE"
                    value={form.department}
                    onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Residence Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none bg-neutral-950 appearance-none"
                  >
                    <option>Hosteller</option>
                    <option>Day Scholar</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Year</label>
                  <input
                    placeholder="e.g. 3rd"
                    value={form.year}
                    onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Branch</label>
                  <input
                    placeholder="e.g. CSE-AI"
                    value={form.branch}
                    onChange={(e) => setForm((s) => ({ ...s, branch: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Designation Role</label>
                  <input
                    placeholder="e.g. Lead Developer"
                    value={form.position}
                    onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingMember(null); }}
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(220,38,38,0.2)] cursor-pointer"
                >
                  {editingMember ? "Save Changes" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
