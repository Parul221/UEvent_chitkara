import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import BackButton from "../components/BackButton";
import {
  LayoutDashboard,
  CalendarPlus2,
  CalendarRange,
  Users,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Edit3,
  Trash2,
  Download,
  Copy,
  MapPin,
  Clock,
  ArrowRight,
  Upload,
  ClipboardList,
  CheckCircle,
  FileSpreadsheet,
} from "lucide-react";

function formatDateISO(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isUpcoming(dateStr) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

export default function ClubDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Registrants Modal states
  const [showRegistrantsModal, setShowRegistrantsModal] = useState(false);
  const [selectedRegistrantEvent, setSelectedRegistrantEvent] = useState(null);
  const [registrantsQuery, setRegistrantsQuery] = useState("");

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    attendees: "",
    description: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  const token = localStorage.getItem("clubToken");
  const clubInfo = JSON.parse(localStorage.getItem("clubInfo") || "{}");

  // Fetch events from backend, fallback to localStorage
  async function fetchEvents() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      if (!res.ok) throw new Error("API not available");
      const data = await res.json();
      const normalized = data.map((e) => ({ ...(e || {}), id: e._id || e.id }));
      setEvents(normalized);
      localStorage.setItem("club_events_v2", JSON.stringify(normalized));
    } catch (err) {
      console.warn("fetchEvents fallback to localStorage:", err);
      try {
        const raw = localStorage.getItem("club_events_v2");
        setEvents(raw ? JSON.parse(raw) : []);
      } catch {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    localStorage.setItem("club_events_v2", JSON.stringify(events));
  }, [events]);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const thisMonth = events.filter((ev) => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    
    // Count total registrations across all events
    const totalRegistrations = events.reduce((acc, ev) => acc + (ev.registrations?.length || 0), 0);
    return { totalEvents, thisMonth, totalRegistrations };
  }, [events]);

  function openNewEvent() {
    setEditingEvent(null);
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      attendees: "0",
      description: "",
      image: "",
    });
    setImagePreview("");
    setShowModal(true);
  }

  function openEditEvent(ev) {
    setEditingEvent(ev);
    setForm({
      title: ev.title || "",
      date: ev.date || "",
      time: ev.time || "",
      location: ev.location || "",
      attendees: ev.attendees || "0",
      description: ev.description || "",
      image: ev.image || "",
    });
    setImagePreview(ev.image || "");
    setShowModal(true);
  }

  function openRegistrants(ev) {
    setSelectedRegistrantEvent(ev);
    setRegistrantsQuery("");
    setShowRegistrantsModal(true);
    document.body.style.overflow = "hidden";
  }

  function closeRegistrantsModal() {
    setSelectedRegistrantEvent(null);
    setShowRegistrantsModal(false);
    document.body.style.overflow = "";
  }

  function handleImageChange(file) {
    if (!file) {
      setImagePreview("");
      setForm((s) => ({ ...s, image: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImagePreview(dataUrl);
      setForm((s) => ({ ...s, image: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.title?.trim() || !form.date) {
      alert("Please provide a title and date.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      location: form.location.trim(),
      attendees: Number(form.attendees) || 0,
      description: form.description.trim(),
      image: form.image || "",
      updatedAt: new Date().toISOString(),
    };

    // EDIT
    if (editingEvent) {
      const id = editingEvent.id || editingEvent._id;
      if (token && API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/events/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const updated = await res.json();
            setEvents((prev) =>
              prev.map((p) =>
                String(p.id) === String(id) ? { ...(updated || {}), id: updated._id || updated.id } : p
              )
            );
            setShowModal(false);
            return;
          }
        } catch (err) {
          console.warn("PUT error (fallback local):", err);
        }
      }

      setEvents((prev) => prev.map((p) => (String(p.id) === String(id) ? { ...p, ...payload } : p)));
      setShowModal(false);
      return;
    }

    // CREATE
    const newLocal = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...payload };

    if (token && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/events`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const created = await res.json();
          const normalized = { ...(created || {}), id: created._id || created.id };
          setEvents((prev) => [normalized, ...prev]);
          setShowModal(false);
          return;
        }
      } catch (err) {
        console.warn("POST error (fallback local):", err);
      }
    }

    setEvents((prev) => [newLocal, ...prev]);
    setShowModal(false);
  }

  async function deleteEvent(id) {
    if (!confirm("Delete this event? This action cannot be undone.")) return;

    if (token && API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setEvents((prev) => prev.filter((p) => String(p.id) !== String(id)));
          return;
        }
      } catch (err) {
        console.warn("DELETE error, fallback local:", err);
      }
    }

    setEvents((prev) => prev.filter((p) => String(p.id) !== String(id)));
  }

  const filteredEvents = events.filter((ev) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (ev.title || "").toLowerCase().includes(q) ||
      (ev.location || "").toLowerCase().includes(q) ||
      (ev.description || "").toLowerCase().includes(q)
    );
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  // Roster Filter inside Registrants Modal
  const filteredRegistrants = useMemo(() => {
    if (!selectedRegistrantEvent) return [];
    const q = registrantsQuery.trim().toLowerCase();
    const list = selectedRegistrantEvent.registrations || [];
    if (!q) return list;
    return list.filter((r) => 
      (r.name || "").toLowerCase().includes(q) ||
      (r.roll || "").toLowerCase().includes(q) ||
      (r.email || "").toLowerCase().includes(q) ||
      (r.group || "").toLowerCase().includes(q)
    );
  }, [selectedRegistrantEvent, registrantsQuery]);

  // CSV copying logic
  function copyRegistrantsToCsv() {
    if (!selectedRegistrantEvent) return;
    const list = selectedRegistrantEvent.registrations || [];
    if (list.length === 0) {
      alert("No registrants to export!");
      return;
    }
    const header = "Name,Roll No,Email,Group,Semester,Year,Residence,Registered At\n";
    const rows = list.map((r) => 
      `"${r.name || ""}","${r.roll || ""}","${r.email || ""}","${r.group || ""}","${r.semester || ""}","${r.year || ""}","${r.residence || ""}","${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""}"`
    ).join("\n");
    navigator.clipboard.writeText(header + rows);
    alert(`Roster for "${selectedRegistrantEvent.title}" copied to clipboard in CSV format! 📋`);
  }

  // Registrants Statistics summary
  const registrantStats = useMemo(() => {
    if (!selectedRegistrantEvent) return { hostellers: 0, dayScholars: 0, byYear: {} };
    const list = selectedRegistrantEvent.registrations || [];
    const hostellers = list.filter((r) => r.residence === "Hosteller").length;
    const dayScholars = list.filter((r) => r.residence === "Day Scholar").length;
    
    const byYear = {};
    list.forEach((r) => {
      const yr = r.year || "TBA";
      byYear[yr] = (byYear[yr] || 0) + 1;
    });

    return { hostellers, dayScholars, byYear };
  }, [selectedRegistrantEvent]);

  // Get initials of club name
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
              onClick={openNewEvent}
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
              className="flex items-center gap-3.5 w-full py-3 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200 text-left font-bold text-xs"
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

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <BackButton className="mb-6" />

        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 border-b border-white/5 pb-6">
          <div>
            <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Club Manager</span>
            <h1 className="text-3xl font-black mt-3 tracking-tight uppercase text-white">Event Dashboard</h1>
            <p className="text-slate-400 text-xs mt-1">Manage events, review registrants lists, and edit cover details.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex items-center flex-1 lg:flex-none">
              <Search size={14} className="absolute left-3.5 text-slate-500" />
              <input
                placeholder="Search events..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full lg:w-60 glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
              />
            </div>
            
            <button
              onClick={openNewEvent}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
            >
              <Plus size={14} />
              Create Event
            </button>
          </div>
        </header>

        {/* Dynamic Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { title: "Active Publications", count: stats.totalEvents, desc: "Total events uploaded by club" },
            { title: "Roster Registrants", count: stats.totalRegistrations, desc: "Active event registration counts" },
            { title: "Monthly Uploads", count: stats.thisMonth, desc: "Created in the current month" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl glass-panel border border-white/5 hover:border-red-500/20 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors"></div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.title}</span>
              <div className="text-3xl font-black mt-3 text-white">{item.count}</div>
              <p className="text-[10px] text-slate-500 mt-1 font-semibold">{item.desc}</p>
            </div>
          ))}
        </section>

        {/* Live Publications Grid */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <ClipboardList size={16} className="text-red-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Active Publications</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
              <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-400 text-xs font-semibold">Fetching publications...</p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
              <ClipboardList size={40} className="text-slate-600 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white">No Publications Found</h3>
              <p className="text-slate-500 text-xs mt-1">Start by clicking the Create Event button to upload.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sortedEvents.map((ev) => {
                const upcoming = isUpcoming(ev.date);
                const regCount = ev.registrations?.length || 0;

                return (
                  <article
                    key={ev.id}
                    className="glass-panel border border-white/5 hover:border-red-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                  >
                    {/* Cover Preview */}
                    <div className="w-full h-44 bg-red-950/10 flex items-center justify-center overflow-hidden relative">
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 flex flex-col items-center justify-center gap-2">
                          <ClipboardList size={32} className="text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">No cover image uploaded</span>
                        </div>
                      )}

                      {/* Status Tag */}
                      <span className={`absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-lg ${
                        upcoming
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-slate-800/80 text-slate-400 border-white/5"
                      }`}>
                        {upcoming ? "upcoming" : "completed"}
                      </span>
                    </div>

                    {/* Body content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors duration-200">{ev.title}</h3>
                        
                        <div className="mt-3.5 space-y-1.5 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-red-500" />
                            <span>{formatDateISO(ev.date)} {ev.time ? `• ${ev.time}` : ""}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-red-500" />
                            <span>{ev.location || "Campus"}</span>
                          </div>
                        </div>

                        {ev.description && (
                          <p className="mt-4 text-xs text-slate-400 leading-relaxed line-clamp-2">{ev.description}</p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                        <button
                          onClick={() => openRegistrants(ev)}
                          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 font-bold cursor-pointer transition"
                        >
                          <Users size={14} />
                          <span>{regCount} Registrants</span>
                          <ArrowRight size={12} />
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditEvent(ev)}
                            className="p-2 border border-white/10 hover:border-white/20 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
                            title="Edit Event"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => deleteEvent(ev.id)}
                            className="p-2 bg-red-600/10 hover:bg-red-600 border border-red-500/20 hover:border-red-500 rounded-xl text-red-400 hover:text-white transition cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Registrants Table Modal */}
      {showRegistrantsModal && selectedRegistrantEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up relative bg-neutral-950">
            {/* Close Button */}
            <button 
              onClick={closeRegistrantsModal} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Roster Manager</span>
                  <h3 className="text-2xl font-black mt-2 tracking-tight text-white uppercase truncate max-w-xl">
                    {selectedRegistrantEvent.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Review student details and export rosters.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyRegistrantsToCsv}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet size={14} className="text-green-400" />
                    Copy CSV to Clipboard
                  </button>
                </div>
              </div>

              {/* Stats Summary strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 bg-white/5 p-4 rounded-2xl border border-white/5 text-center sm:text-left">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Count</div>
                  <div className="text-xl font-black text-white mt-1">{(selectedRegistrantEvent.registrations || []).length} Students</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hostellers</div>
                  <div className="text-xl font-black text-red-500 mt-1">{registrantStats.hostellers}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Day Scholars</div>
                  <div className="text-xl font-black text-red-500 mt-1">{registrantStats.dayScholars}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">By Academic Year</div>
                  <div className="text-xs font-bold text-white mt-1.5 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {Object.entries(registrantStats.byYear).map(([yr, count]) => (
                      <span key={yr} className="bg-black/35 px-1.5 py-0.5 rounded text-[10px] border border-white/5">
                        Yr {yr}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Search filter input */}
              <div className="relative flex items-center mt-6">
                <Search size={14} className="absolute left-3.5 text-slate-500" />
                <input
                  placeholder="Filter student directory roster by name, roll number, or group..."
                  value={registrantsQuery}
                  onChange={(e) => setForm((s) => ({ ...s })) /* dummy for state reset? no, set state correctly: */
                  || setRegistrantsQuery(e.target.value)}
                  className="w-full glass-input rounded-xl pl-9 pr-4 py-2.5 text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                />
              </div>
            </div>

            {/* Modal Body: Roster Table */}
            <div className="flex-1 overflow-auto p-6">
              {filteredRegistrants.length === 0 ? (
                <div className="text-center py-14 text-slate-500">
                  <Users size={32} className="mx-auto mb-2 text-slate-600" />
                  <p className="text-xs font-bold">No students registered or matching filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2">Name</th>
                        <th className="pb-3">Roll No</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Group</th>
                        <th className="pb-3 text-center">Semester</th>
                        <th className="pb-3 text-center">Year</th>
                        <th className="pb-3">Residence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRegistrants.map((r, i) => (
                        <tr key={i} className="hover:bg-white/5 transition duration-200">
                          <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-[10px] text-red-400">
                              {(r.name || "?").slice(0, 1).toUpperCase()}
                            </div>
                            <span>{r.name}</span>
                          </td>
                          <td className="py-3 text-slate-300 font-semibold">{r.roll}</td>
                          <td className="py-3 text-slate-400">{r.email}</td>
                          <td className="py-3 text-slate-400">{r.group || "—"}</td>
                          <td className="py-3 text-center text-slate-400 font-semibold">{r.semester || "—"}</td>
                          <td className="py-3 text-center text-slate-400 font-semibold">{r.year || "—"}</td>
                          <td className="py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              r.residence === "Hosteller"
                                ? "bg-red-500/10 border-red-500/30 text-red-400"
                                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            }`}>
                              {r.residence || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end">
              <button
                onClick={closeRegistrantsModal}
                className="px-5 py-2 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
              >
                Close Roster
              </button>
            </div>

          </div>
        </div>
      )}

      {/* New/Edit Event Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col p-6 sm:p-8 animate-scale-up bg-neutral-950 relative max-h-[90vh]">
            
            {/* Close */}
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              {editingEvent ? "Edit Publication" : "New Publication"}
            </h3>
            <p className="text-slate-400 text-xs mb-6">Describe event parameters, dates, timings, and custom cover images.</p>

            <form onSubmit={submitForm} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Event Title</label>
                <input
                  required
                  placeholder="e.g. Smart Contracts workshop"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Date</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none bg-neutral-950 appearance-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((s) => ({ ...s, time: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none bg-neutral-950 appearance-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Location</label>
                  <input
                    placeholder="e.g. Turing Hall, Block 3"
                    value={form.location}
                    onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Attendees Target (optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={form.attendees}
                    onChange={(e) => setForm((s) => ({ ...s, attendees: e.target.value }))}
                    className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Event Description</label>
                <textarea
                  placeholder="Provide complete guidelines, registration rules, timelines, and rewards..."
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                  className="w-full glass-input p-3 mt-1 rounded-xl text-xs text-white border border-white/10 focus:border-red-500/50 outline-none resize-none"
                />
              </div>

              {/* Cover Artwork Uploader */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Event Banner Artwork</label>
                <div className="mt-2 flex items-start gap-4 p-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <div className="w-28 h-20 border border-white/10 rounded-xl overflow-hidden bg-neutral-900 flex items-center justify-center text-slate-500 text-xs">
                    {imagePreview ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" /> : "No preview"}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(ev) => { const file = ev.target.files && ev.target.files[0]; handleImageChange(file); }} 
                      className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-white/10 file:text-white hover:file:bg-white/15 file:cursor-pointer"
                    />
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setImagePreview(""); setForm((s) => ({ ...s, image: "" })); }} 
                        className="px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-bold hover:bg-white/5 transition"
                      >
                        Remove Cover
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold text-slate-300 hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(220,38,38,0.2)] cursor-pointer"
                >
                  {editingEvent ? "Save Changes" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
