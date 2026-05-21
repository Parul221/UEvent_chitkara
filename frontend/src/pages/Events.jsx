import React, { useEffect, useMemo, useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Search, 
  Users, 
  Clock, 
  Share2, 
  Plus, 
  Download, 
  ExternalLink, 
  Check, 
  Loader2, 
  X, 
  ChevronDown, 
  Tag, 
  User, 
  Mail, 
  Hash, 
  GraduationCap, 
  Laptop, 
  Camera, 
  Lightbulb, 
  Trophy, 
  Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import {
  getStudentProfile,
  getStudentToken,
  profileToRegistrationForm,
  saveStudentProfile,
} from "../utils/studentProfile";

// Helpers for visual categorizations
function getEventCategory(event) {
  const title = (event.title || "").toLowerCase();
  const desc = (event.description || "").toLowerCase();
  
  if (
    title.includes("tech") || 
    title.includes("code") || 
    title.includes("program") || 
    title.includes("summit") || 
    desc.includes("coding") || 
    desc.includes("technology") || 
    desc.includes("developer") || 
    title.includes("hackathon")
  ) {
    return {
      name: "Tech & Dev",
      gradient: "from-blue-600/20 via-indigo-950/30 to-purple-600/20",
      border: "border-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      icon: "laptop",
      color: "text-blue-400"
    };
  }
  if (
    title.includes("photo") || 
    title.includes("camera") || 
    title.includes("art") || 
    title.includes("paint") || 
    title.includes("dance") || 
    title.includes("sing") || 
    title.includes("music") || 
    title.includes("cultural") || 
    title.includes("night") || 
    desc.includes("dance") || 
    desc.includes("art") || 
    desc.includes("creative")
  ) {
    return {
      name: "Creative & Arts",
      gradient: "from-pink-600/20 via-rose-950/30 to-red-600/20",
      border: "border-rose-500/20 hover:border-rose-500/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]",
      icon: "camera",
      color: "text-rose-400"
    };
  }
  if (
    title.includes("entrepreneur") || 
    title.includes("bootcamp") || 
    title.includes("startup") || 
    title.includes("business") || 
    title.includes("money") || 
    desc.includes("startup") || 
    desc.includes("pitch") || 
    title.includes("seminar")
  ) {
    return {
      name: "Business & Startup",
      gradient: "from-amber-600/20 via-orange-950/30 to-yellow-600/20",
      border: "border-amber-500/20 hover:border-amber-500/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
      icon: "lightbulb",
      color: "text-amber-400"
    };
  }
  if (
    title.includes("sport") || 
    title.includes("meet") || 
    title.includes("football") || 
    title.includes("cricket") || 
    title.includes("athlet") || 
    desc.includes("sport") || 
    desc.includes("game")
  ) {
    return {
      name: "Sports & Fitness",
      gradient: "from-emerald-600/20 via-teal-950/30 to-blue-600/20",
      border: "border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
      icon: "trophy",
      color: "text-emerald-400"
    };
  }
  return {
    name: "Campus Social",
    gradient: "from-red-600/10 via-neutral-900/40 to-red-950/30",
    border: "border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)]",
    icon: "sparkles",
    color: "text-red-400"
  };
}

function CategoryIcon({ name, size = 36, className = "" }) {
  switch (name) {
    case "laptop": return <Laptop size={size} className={className} />;
    case "camera": return <Camera size={size} className={className} />;
    case "lightbulb": return <Lightbulb size={size} className={className} />;
    case "trophy": return <Trophy size={size} className={className} />;
    default: return <Sparkles size={size} className={className} />;
  }
}

function parseEventDate(dateString) {
  if (!dateString) return { month: "TBA", day: "" };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return { month: dateString.slice(0, 3).toUpperCase(), day: "" };
  }
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  return { month, day };
}

function getGoogleCalendarUrl(event) {
  const title = encodeURIComponent(event.title || "Campus Event");
  const details = encodeURIComponent(event.description || "");
  const location = encodeURIComponent(event.location || "Campus");
  
  let dates = "";
  if (event.date) {
    const baseDate = event.date.replace(/-/g, "");
    let startTime = "100000";
    let endTime = "120000";
    if (event.time) {
      const timeStr = event.time.toLowerCase();
      let hour = 10;
      let minute = 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)?/);
      if (match) {
        hour = parseInt(match[1]);
        minute = parseInt(match[2]);
        const ampm = match[3];
        if (ampm === "pm" && hour < 12) hour += 12;
        if (ampm === "am" && hour === 12) hour = 0;
      }
      const startHourStr = String(hour).padStart(2, "0");
      const startMinStr = String(minute).padStart(2, "0");
      startTime = `${startHourStr}${startMinStr}00`;
      
      const endHourStr = String((hour + 2) % 24).padStart(2, "0");
      endTime = `${endHourStr}${startMinStr}00`;
    }
    dates = `${baseDate}T${startTime}/${baseDate}T${endTime}`;
  }
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

function downloadIcsFile(event) {
  const title = event.title || "Campus Event";
  const desc = event.description || "";
  const loc = event.location || "Campus";
  const dateStr = event.date ? event.date.replace(/-/g, "") : "20260605";
  
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PROID:-//UEvent Hub//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    `DTSTART:${dateStr}T100000`,
    `DTEND:${dateStr}T120000`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${title.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Custom input component inside registration modal
function StyledInput({ icon: Icon, label, value, onChange, type = "text", required = true, disabled = false }) {
  return (
    <div className="relative flex flex-col gap-1 w-full">
      <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3.5 text-slate-500" size={16} />}
        <input
          required={required}
          type={type}
          disabled={disabled}
          placeholder={`Enter ${label.toLowerCase()}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`glass-input rounded-xl pl-10 pr-4 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
      </div>
    </div>
  );
}

// Skeleton card for loading state
function EventCardSkeleton() {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[420px] border border-white/5 animate-pulse">
      <div className="h-44 bg-white/5 relative"></div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-6 bg-white/10 rounded-md w-3/4 mb-3"></div>
          <div className="h-4 bg-white/5 rounded-md w-full mb-2"></div>
          <div className="h-4 bg-white/5 rounded-md w-5/6 mb-4"></div>
        </div>
        <div className="space-y-3">
          <div className="h-3 bg-white/5 rounded w-1/2"></div>
          <div className="h-3 bg-white/5 rounded w-2/3"></div>
          <div className="h-10 bg-white/10 rounded-xl w-full mt-4"></div>
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  
  // Filters state
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [myRegistrationsOnly, setMyRegistrationsOnly] = useState(false);
  const [activeCalDropdown, setActiveCalDropdown] = useState(null);

  // Form registration states
  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    group: "",
    semester: "",
    year: "",
    residence: "Hosteller",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Toasts state
  const [toast, setToast] = useState({ message: "", type: "success" });

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 3000);
  }

  // Parse share search query parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setQuery(searchParam);
    }
    const categoryParam = params.get("category");
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
  }, []);

  // Close calendar dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside() {
      setActiveCalDropdown(null);
    }
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const cachedProfile = getStudentProfile();
    if (cachedProfile.email) {
      setForm(profileToRegistrationForm(cachedProfile));
    }

    async function loadProfile() {
      const token = getStudentToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          saveStudentProfile(data.user);
          setForm(profileToRegistrationForm(data.user));
        }
      } catch (err) {
        console.warn("Profile load error:", err);
      }
    }

    loadProfile();
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/events`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Events load error:", err);
        showToast("Failed to fetch events from server", "error");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  function isRegistered(event) {
    const student = getStudentProfile();
    if (!student.email && !student.userId) return false;

    return (event.registrations || []).some((registration) => {
      const sameEmail =
        student.email &&
        registration.email &&
        registration.email.toLowerCase() === student.email.toLowerCase();
      const sameRoll =
        student.userId &&
        registration.roll &&
        registration.roll.toLowerCase() === student.userId.toLowerCase();
      return sameEmail || sameRoll;
    });
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return events
      .filter((event) => {
        // Query match
        const matchQuery = !q ||
          event.title?.toLowerCase().includes(q) ||
          event.location?.toLowerCase().includes(q) ||
          event.description?.toLowerCase().includes(q);
        if (!matchQuery) return false;

        // Category match
        if (categoryFilter !== "All") {
          const cat = getEventCategory(event);
          if (cat.name !== categoryFilter) return false;
        }

        // Date filter match
        if (dateFilter !== "All" && event.date) {
          const evDate = new Date(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (dateFilter === "Today") {
            const dateOnly = new Date(evDate);
            dateOnly.setHours(0, 0, 0, 0);
            if (dateOnly.getTime() !== today.getTime()) return false;
          } else if (dateFilter === "This Week") {
            const nextWeek = new Date(today);
            nextWeek.setDate(today.getDate() + 7);
            if (evDate < today || evDate > nextWeek) return false;
          } else if (dateFilter === "This Month") {
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            if (evDate < today || evDate > nextMonth) return false;
          }
        }

        // My registrations only
        if (myRegistrationsOnly) {
          if (!isRegistered(event)) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  }, [events, query, categoryFilter, dateFilter, myRegistrationsOnly, form.email]);

  function openRegistration(event) {
    if (isRegistered(event)) return;

    const student = getStudentProfile();
    if (!student.email) {
      navigate("/login");
      return;
    }

    setSelected(event);
    setMessage("");
    setRegistrationSuccess(false);
    setForm(profileToRegistrationForm(student));
  }

  async function submitRegistration(e) {
    e.preventDefault();
    if (!selected) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/events/${selected._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Registration failed.");
        showToast(data.error || "Registration failed.", "error");
        setIsSubmitting(false);
        return;
      }

      setEvents((prev) =>
        prev.map((event) =>
          event._id === selected._id ? { ...event, ...(data.event || {}), attendees: data.attendees } : event
        )
      );
      if (data.user) {
        saveStudentProfile(data.user);
        setForm(profileToRegistrationForm(data.user));
      }
      
      setRegistrationSuccess(true);
      showToast("Registration successful! 🎉", "success");
      
      setTimeout(() => {
        setSelected(null);
        setRegistrationSuccess(false);
      }, 2500);
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("Network error. Please try again.");
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const shareEvent = async (event) => {
    const queryShareUrl = `${window.location.origin}/events?search=${encodeURIComponent(event.title)}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: queryShareUrl,
        });
      } else {
        await navigator.clipboard.writeText(queryShareUrl);
        showToast("Link copied to clipboard! 📋", "success");
      }
    } catch {
      showToast("Could not share event.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-16">
      <Navbar />

      {/* Toast Alert */}
      {toast.message && (
        <div className="fixed right-6 top-20 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs font-semibold ${
            toast.type === "success" 
              ? "bg-green-950/80 border-green-500/30 text-green-300" 
              : "bg-red-950/80 border-red-500/30 text-red-300"
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast({ message: "", type: "success" })} className="hover:text-white transition">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <BackButton className="mb-6" />
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-red-500 tracking-tight">Campus Events</h1>
            <p className="text-slate-400 text-sm mt-2">
              Discover {filtered.length} upcoming club events and sync details directly to your timeline.
            </p>
          </div>
        </header>

        {/* Advanced Filters Panel */}
        <div className="flex flex-col gap-5 mt-6">
          {/* Category Filter Tabs */}
          <div className="flex items-center overflow-x-auto pb-2 scrollbar-none gap-2">
            {["All", "Tech & Dev", "Creative & Arts", "Business & Startup", "Sports & Fitness", "Campus Social"].map((catName) => {
              const isActive = categoryFilter === catName;
              return (
                <button
                  key={catName}
                  onClick={() => setCategoryFilter(catName)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                      : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Search & Secondary Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 max-w-xl">
              <Search size={16} className="absolute left-4 text-slate-400" />
              <input
                className="glass-input rounded-2xl pl-11 pr-10 py-2.5 w-full text-xs text-white border border-white/10 focus:border-red-500/50"
                placeholder="Search by event title, location, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 text-slate-400 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Dropdowns & Toggle Switch */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter Dropdown */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="glass-input rounded-2xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-300 border border-white/10 appearance-none cursor-pointer focus:border-red-500/50 bg-black/60 outline-none"
                >
                  <option value="All">All Dates</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
                <ChevronDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* My Registrations Switch */}
              {getStudentProfile().email && (
                <button
                  onClick={() => setMyRegistrationsOnly(!myRegistrationsOnly)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                    myRegistrationsOnly
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <Tag size={12} />
                  My Registrations
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 animate-pulse">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </section>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl mt-8">
            <Calendar size={48} className="text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No Events Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
              We couldn't find any events matching your current filters or query. Try adjusting your selections.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filtered.map((event) => {
              const registered = isRegistered(event);
              const category = getEventCategory(event);
              const eventDateObj = parseEventDate(event.date);

              return (
                <article 
                  key={event._id} 
                  className={`glass-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1.5 border ${category.border} relative group h-[420px]`}
                >
                  {/* Banner Artwork Area */}
                  <div className="h-44 bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${category.gradient} flex items-center justify-center relative transition-transform duration-700 group-hover:scale-105`}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
                        <CategoryIcon name={category.icon} size={48} className={`${category.color} opacity-70`} />
                      </div>
                    )}

                    {/* Date Tag */}
                    <div className="absolute left-4 top-4 z-10">
                      <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-xl p-1.5 text-white border border-white/10 w-12 h-12 shadow-lg">
                        <span className="text-[9px] uppercase font-bold tracking-wider leading-none text-red-500">{eventDateObj.month}</span>
                        <span className="text-lg font-extrabold leading-none mt-1">{eventDateObj.day}</span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute right-4 top-4 z-10">
                      <span className="inline-block bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-white">
                        {category.name}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white group-hover:text-red-500 transition-colors duration-300 line-clamp-1">{event.title}</h2>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2 h-8">
                        {event.description || "No description provided."}
                      </p>
                      
                      <div className="mt-4 space-y-2 text-xs text-slate-300">
                        <p className="flex items-center gap-2 text-slate-400">
                          <Clock size={14} className="text-red-500" /> 
                          <span>{event.date || "TBA"} {event.time ? `• ${event.time}` : ""}</span>
                        </p>
                        <p className="flex items-center gap-2 text-slate-400">
                          <MapPin size={14} className="text-red-500" /> 
                          <span className="line-clamp-1">{event.location || "Campus"}</span>
                        </p>
                        <p className="flex items-center gap-2 text-slate-400">
                          <Users size={14} className="text-red-500" /> 
                          <span>{event.attendees || 0} registered</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Panel */}
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => openRegistration(event)}
                        disabled={registered}
                        className={`flex-1 rounded-xl py-2.5 font-semibold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                          registered
                            ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                            : "glass-button text-white"
                        }`}
                      >
                        {registered ? (
                          <>
                            <Check size={14} />
                            Registered
                          </>
                        ) : (
                          "Register"
                        )}
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => shareEvent(event)}
                        className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition duration-300 flex items-center justify-center cursor-pointer"
                        title="Share Event"
                      >
                        <Share2 size={14} />
                      </button>

                      {/* Add to Calendar Dropdown */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCalDropdown(activeCalDropdown === event._id ? null : event._id);
                          }}
                          className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition duration-300 flex items-center justify-center cursor-pointer h-full"
                          title="Add to Calendar"
                        >
                          <Plus size={14} />
                        </button>

                        {activeCalDropdown === event._id && (
                          <div className="absolute right-0 bottom-full mb-2 w-40 rounded-xl bg-black/95 border border-white/15 backdrop-blur-xl shadow-2xl p-1 z-20 animate-fade-in flex flex-col gap-0.5">
                            <a
                              href={getGoogleCalendarUrl(event)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                              onClick={() => setActiveCalDropdown(null)}
                            >
                              <ExternalLink size={12} />
                              Google Cal
                            </a>
                            <button
                              onClick={() => {
                                downloadIcsFile(event);
                                setActiveCalDropdown(null);
                              }}
                              className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                            >
                              <Download size={12} />
                              ICS File
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Double Column Registration Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scale-up relative">
            {/* Close Button */}
            <button 
              onClick={() => setSelected(null)} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Left Column: Event details */}
            <div className="w-full md:w-1/2 relative bg-black/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-60 md:h-auto overflow-y-auto scrollbar-none">
              {selected.image ? (
                <img src={selected.image} alt={selected.title} className="w-full h-44 md:h-56 object-cover" />
              ) : (
                <div className={`h-44 md:h-56 flex items-center justify-center bg-gradient-to-br ${getEventCategory(selected).gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                  <CategoryIcon name={getEventCategory(selected).icon} size={64} className={`${getEventCategory(selected).color} opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getEventCategory(selected).border} ${getEventCategory(selected).color} mb-3`}>
                    {getEventCategory(selected).name}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white leading-tight">{selected.title}</h2>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">{selected.description || "No description provided."}</p>
                </div>
                
                <div className="mt-6 space-y-3 border-t border-white/5 pt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selected.date || "TBA"}</p>
                      <p className="text-[10px] text-slate-400">{selected.time || "Time TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selected.location || "Campus"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selected.attendees || 0} Registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Registration Form or Success Screen */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-black/20 overflow-y-auto max-h-[calc(90vh-15rem)] md:max-h-full">
              {registrationSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Check size={28} className="animate-scale-up" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Registration Confirmed!</h3>
                  <p className="text-slate-400 mt-2 text-xs max-w-xs leading-relaxed">
                    You are now registered for <strong>{selected.title}</strong>. Your profile details have been synced.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Student Registration</h3>
                    <p className="text-slate-400 text-[10px] mb-5">Verify or complete your details to join this event.</p>
                    
                    {message && (
                      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs">
                        {message}
                      </div>
                    )}

                    <form onSubmit={submitRegistration} className="space-y-3.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <StyledInput label="Name" icon={User} value={form.name} onChange={(val) => setForm((s) => ({ ...s, name: val }))} />
                        <StyledInput label="Roll No" icon={Hash} value={form.roll} onChange={(val) => setForm((s) => ({ ...s, roll: val }))} />
                      </div>
                      
                      <StyledInput label="Email" type="email" icon={Mail} value={form.email} onChange={(val) => setForm((s) => ({ ...s, email: val }))} />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <StyledInput label="Group" required={false} icon={Users} value={form.group} onChange={(val) => setForm((s) => ({ ...s, group: val }))} />
                        <StyledInput label="Semester" icon={GraduationCap} value={form.semester} onChange={(val) => setForm((s) => ({ ...s, semester: val }))} />
                        <StyledInput label="Year" icon={Calendar} value={form.year} onChange={(val) => setForm((s) => ({ ...s, year: val }))} />
                      </div>

                      <div className="flex flex-col gap-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase pl-1">Residence</label>
                        <select
                          value={form.residence}
                          onChange={(e) => setForm((s) => ({ ...s, residence: e.target.value }))}
                          className="glass-input rounded-xl px-3 py-2.5 text-xs text-white border border-white/10 focus:border-red-500/50 outline-none w-full bg-neutral-900"
                        >
                          <option value="Hosteller">Hosteller</option>
                          <option value="Day Scholar">Day Scholar</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4 glass-button rounded-xl py-3 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            Registering...
                          </>
                        ) : (
                          "Confirm Registration"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
