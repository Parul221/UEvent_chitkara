import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Calendar,
  Users,
  Award,
  Search,
  ChevronDown,
  Clock,
  MapPin,
  Tag,
  ArrowRight,
  Download,
  X,
  User,
  Mail,
  Hash,
  GraduationCap,
  Loader2,
  Check,
  Laptop,
  Camera,
  Lightbulb,
  Trophy,
  Sparkles,
  Share2 as ShareIcon,
} from "lucide-react";
import { API_BASE } from "../config/api";
import {
  getStudentProfile,
  getStudentToken,
  profileToRegistrationForm,
  saveStudentProfile,
} from "../utils/studentProfile";

// Import local club images for spotlight
import img1 from "../assets/1.jpeg";
import img2 from "../assets/2.jpeg";
import img3 from "../assets/3.jpeg";
import img4 from "../assets/4.jpeg";

/* ---------- countdown timer hook ---------- */
function useCountdown(targetDate) {
  const target = useMemo(() => (targetDate ? new Date(targetDate).getTime() : null), [targetDate]);
  const [remaining, setRemaining] = useState(() => (target ? Math.max(target - Date.now(), 0) : 0));

  useEffect(() => {
    if (!target) return;
    function tick() {
      setRemaining(Math.max(target - Date.now(), 0));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return remaining;
}

function formatRemaining(ms) {
  if (ms <= 0) return "Started";
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

/* ---------- Category Helpers ---------- */
function getEventCategory(event) {
  const title = (event.title || "").toLowerCase();
  const desc = (event.description || "").toLowerCase();
  
  if (
    title.includes("tech") || 
    title.includes("code") || 
    title.includes("hack") || 
    title.includes("web") || 
    title.includes("app") || 
    title.includes("develop") || 
    title.includes("comput") ||
    desc.includes("tech") || 
    desc.includes("code") || 
    desc.includes("hackathon")
  ) {
    return {
      name: "Tech & Dev",
      gradient: "from-blue-600/20 via-indigo-950/30 to-blue-900/20",
      border: "border-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
      icon: "laptop",
      color: "text-blue-400"
    };
  }
  if (
    title.includes("photo") || 
    title.includes("art") || 
    title.includes("music") || 
    title.includes("dance") || 
    title.includes("paint") || 
    title.includes("cultur") || 
    title.includes("drama") ||
    desc.includes("photo") || 
    desc.includes("art") || 
    desc.includes("music")
  ) {
    return {
      name: "Creative & Arts",
      gradient: "from-rose-600/20 via-purple-950/30 to-pink-600/20",
      border: "border-pink-500/20 hover:border-pink-500/60 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]",
      icon: "camera",
      color: "text-pink-400"
    };
  }
  if (
    title.includes("business") || 
    title.includes("pitch") || 
    title.includes("start") || 
    title.includes("invest") || 
    title.includes("market") || 
    title.includes("bootcamp") || 
    title.includes("entrepreneur") ||
    desc.includes("business") || 
    desc.includes("startup")
  ) {
    return {
      name: "Business & Startup",
      gradient: "from-amber-600/20 via-orange-950/30 to-yellow-600/20",
      border: "border-yellow-500/20 hover:border-yellow-500/60 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]",
      icon: "lightbulb",
      color: "text-yellow-400"
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

/* ---------- tiny skeleton loader ---------- */
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

/* ---------- Custom Input for Modal ---------- */
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

/* ---------- Main Home ---------- */
function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalType, setModalType] = useState(null); // 'details' or 'register'
  
  const [form, setForm] = useState({
    name: "",
    roll: "",
    email: "",
    group: "",
    semester: "",
    year: "",
    residence: "Hosteller",
  });

  const [toast, setToast] = useState({ message: "", type: "success" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [activeCalDropdown, setActiveCalDropdown] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "success" });
    }, 3000);
  }

  // Fetch events on mount
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch(`${API_BASE}/api/events`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sort by upcoming date
          data.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
          setEvents(data);
        }
      } catch (err) {
        console.error("Events fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  // Fetch student profile on mount
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
        console.warn("Could not load student profile:", err);
      }
    }

    loadProfile();
  }, []);

  // Close calendar dropdowns on clicking outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (activeCalDropdown && !e.target.closest(".calendar-dropdown-container")) {
        setActiveCalDropdown(null);
      }
    }
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [activeCalDropdown]);

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

  function openDetails(event) {
    setSelectedEvent(event);
    setModalType("details");
    document.body.style.overflow = "hidden";
  }

  function openRegistration(event) {
    if (isRegistered(event)) return;

    const student = getStudentProfile();
    if (!student.email) {
      navigate("/login");
      return;
    }

    setSelectedEvent(event);
    setModalType("register");
    setRegistrationSuccess(false);
    setForm(profileToRegistrationForm(student));
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    setSelectedEvent(null);
    setModalType(null);
    setRegistrationSuccess(false);
    document.body.style.overflow = "";
  }

  const shareEvent = async (event, e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/events?search=${encodeURIComponent(event.title || "")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.title, text: event.description, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Share link copied to clipboard!");
      }
    } catch (err) {
      console.warn("Share error:", err);
    }
  };

  async function submitRegistration(e) {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/events/${selectedEvent._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Registration failed", "error");
      } else {
        setRegistrationSuccess(true);
        showToast("Registration successful! 🎉", "success");
        
        // Update local events state
        if (data.attendees !== undefined) {
          setEvents((prev) =>
            prev.map((ev) =>
              ev._id === selectedEvent._id ? { ...ev, registrations: data.event?.registrations || [], attendees: data.attendees } : ev
            )
          );
        }

        if (data.user) {
          saveStudentProfile(data.user);
          setForm(profileToRegistrationForm(data.user));
        }

        setTimeout(() => {
          closeModal();
        }, 2200);
      }
    } catch (err) {
      console.error(err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Get top 3 upcoming active events
  const featuredEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter((ev) => !ev.date || new Date(ev.date).getTime() >= now)
      .slice(0, 3);
  }, [events]);

  const categories = [
    { name: "Tech & Dev", desc: "Hackathons, coding challenges, and tech seminars.", color: "from-blue-500 to-indigo-500", icon: "laptop" },
    { name: "Creative & Arts", desc: "Music, photography walks, dramas, and art exhibitions.", color: "from-pink-500 to-rose-500", icon: "camera" },
    { name: "Business & Startup", desc: "Pitch competitions, leadership bootcamps, and business summits.", color: "from-yellow-500 to-amber-500", icon: "lightbulb" },
    { name: "Sports & Fitness", desc: "Football championships, cricket tournaments, and athletic runs.", color: "from-emerald-500 to-teal-500", icon: "trophy" },
    { name: "Campus Social", desc: "Networking events, cultural nights, and open social gatherings.", color: "from-red-500 to-orange-500", icon: "sparkles" },
  ];

  const hardcodedClubs = [
    { id: 1, name: "Music Club", organizer: "Rahul Sharma", image: img1, desc: "A vibrant home for campus instrumentalists, vocalists, and music enthusiasts." },
    { id: 2, name: "Dance Club", organizer: "Priya Singh", image: img2, desc: "Bringing rhythm and energy to campus with street dance, classical, and fusion." },
    { id: 3, name: "Tech Club", organizer: "Ankit Verma", image: img3, desc: "Focusing on competitive programming, app/web dev, and cutting-edge robotics." },
    { id: 4, name: "Art Club", organizer: "Neha Gupta", image: img4, desc: "Fostering visual creativity through painting, sculpture, sketching, and design." }
  ];

  const modalRegistered = selectedEvent ? isRegistered(selectedEvent) : false;

  return (
    <div className="w-full bg-black text-white min-h-screen">
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

      {/* Hero Section */}
      <div
        className="relative w-full min-h-[90vh] md:min-h-screen bg-center bg-cover flex flex-col justify-between pt-24 pb-12"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url('https://pbs.twimg.com/media/EPmoSv2U4AA4GzK.jpg')`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center items-center text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl max-w-4xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scale-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight uppercase tracking-tight">
              <span className="block text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">Discover Campus Life</span>
              <span className="block bg-gradient-to-r from-red-500 via-rose-600 to-red-700 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(220,38,38,0.3)] mt-2">Join the Experience</span>
            </h1>
            
            <p className="mt-6 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
              Explore dynamic workshops, competitive hackathons, visual art galleries, and major athletic meets. Connect with student-led clubs and sync events directly to your personal calendars.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/events")}
                className="glass-button text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:shadow-red-500/20"
              >
                Browse All Events
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate("/clubs")}
                className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-red-500/50 hover:bg-white/5 transition flex items-center justify-center gap-2 cursor-pointer text-slate-300 hover:text-white"
              >
                Explore Clubs
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Calendar size={20} className="text-red-500" />, title: "150+", subtitle: "Active Events This Term" },
              { icon: <Users size={20} className="text-red-500" />, title: "50+", subtitle: "Registered Student Clubs" },
              { icon: <Award size={20} className="text-red-500" />, title: "5000+", subtitle: "Active Campus Members" },
            ].map((s, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 hover:border-red-500/30 transition-all duration-300 flex items-center gap-4 group hover:scale-[1.02]"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-red-500/10 transition-colors">
                  {s.icon}
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white tracking-tight">{s.title}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{s.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 1: Category Explorer */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Explorer</span>
          <h2 className="text-3xl font-black mt-3 tracking-tight uppercase">Explore by Category</h2>
          <p className="text-slate-400 text-xs mt-2">Filter and inspect specialized events aligned with your engineering, creative, or athletic interests.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat, i) => {
            return (
              <div
                key={i}
                onClick={() => navigate(`/events?category=${encodeURIComponent(cat.name)}`)}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col justify-between h-56 cursor-pointer group hover:-translate-y-1.5"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-lg`}>
                    <CategoryIcon name={cat.icon} size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mt-5 group-hover:text-red-500 transition-colors">{cat.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-3">{cat.desc}</p>
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-400 group-hover:text-red-400 transition-colors mt-4">
                  <span>Explore Events</span>
                  <ArrowRight size={12} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Featured Events Feed */}
      <section className="py-20 bg-gradient-to-b from-black via-neutral-950/40 to-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Spotlight</span>
              <h2 className="text-3xl font-black mt-3 tracking-tight uppercase">Featured Events</h2>
              <p className="text-slate-400 text-xs mt-2">Get involved in the most popular and upcoming student affairs on campus.</p>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 mt-4 sm:mt-0"
            >
              View All Events
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
              <Calendar size={40} className="text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white">No Upcoming Events</h3>
              <p className="text-slate-500 text-xs mt-1">Check back later or view completed listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => {
                const registered = isRegistered(event);
                const category = getEventCategory(event);
                const eventDateObj = parseEventDate(event.date);

                return (
                  <article
                    key={event._id}
                    className={`glass-panel rounded-2xl overflow-hidden flex flex-col justify-between border ${category.border} transition-all duration-500 hover:-translate-y-1.5 relative group h-[420px]`}
                  >
                    {/* Banner Image */}
                    <div className="h-44 bg-black/40 flex items-center justify-center relative overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${category.gradient} flex items-center justify-center relative transition-transform duration-700 group-hover:scale-105`}>
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-40"></div>
                          <CategoryIcon name={category.icon} size={48} className={`${category.color} opacity-70`} />
                        </div>
                      )}

                      {/* Date tear sheet badge */}
                      <div className="absolute left-4 top-4 z-10">
                        <div className="flex flex-col items-center justify-center bg-black/60 backdrop-blur-md rounded-xl p-1.5 text-white border border-white/10 w-12 h-12 shadow-lg">
                          <span className="text-[9px] uppercase font-bold tracking-wider leading-none text-red-500">{eventDateObj.month}</span>
                          <span className="text-lg font-extrabold leading-none mt-1">{eventDateObj.day}</span>
                        </div>
                      </div>

                      {/* Category tag */}
                      <div className="absolute right-4 top-4 z-10">
                        <span className="inline-block bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10 text-white">
                          {category.name}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-red-500 transition-colors line-clamp-1">{event.title}</h3>
                        <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-2 h-8">
                          {event.description || "No description provided."}
                        </p>

                        <div className="mt-4 space-y-1.5 text-[11px] text-slate-400">
                          <p className="flex items-center gap-2">
                            <Clock size={12} className="text-red-500" />
                            <span>{event.date || "TBA"} {event.time ? `• ${event.time}` : ""}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin size={12} className="text-red-500" />
                            <span className="line-clamp-1">{event.location || "Campus"}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Users size={12} className="text-red-500" />
                            <span>{event.attendees || 0} registered</span>
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex gap-2 relative">
                        <button
                          onClick={() => openDetails(event)}
                          className="flex-1 border border-white/15 hover:border-white/30 text-white py-2 rounded-xl text-xs font-bold transition hover:bg-white/5 cursor-pointer text-center"
                        >
                          View Details
                        </button>

                        <button
                          onClick={() => openRegistration(event)}
                          disabled={registered}
                          className={`flex-1 rounded-xl py-2 font-bold text-xs transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
                            registered
                              ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                              : "glass-button text-white"
                          }`}
                        >
                          {registered ? (
                            <>
                              <Check size={12} />
                              Registered
                            </>
                          ) : (
                            "Register"
                          )}
                        </button>

                        {/* Share action */}
                        <button
                          onClick={(e) => shareEvent(event, e)}
                          className="p-2 border border-white/15 hover:border-white/30 hover:bg-white/5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                          title="Share Link"
                        >
                          <ShareIcon size={12} />
                        </button>

                        {/* Calendar Dropdown */}
                        <div className="relative calendar-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCalDropdown(activeCalDropdown === event._id ? null : event._id);
                            }}
                            className="p-2 border border-white/15 hover:border-white/30 hover:bg-white/5 rounded-xl flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
                            title="Add to Calendar"
                          >
                            <Calendar size={12} />
                          </button>

                          {activeCalDropdown === event._id && (
                            <div className="absolute right-0 bottom-full mb-2 w-32 bg-neutral-900 border border-white/10 rounded-xl p-1.5 shadow-2xl z-20 backdrop-blur-xl animate-fade-in">
                              <a
                                href={getGoogleCalendarUrl(event)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveCalDropdown(null)}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                              >
                                Google
                              </a>
                              <button
                                onClick={() => {
                                  downloadIcsFile(event);
                                  setActiveCalDropdown(null);
                                }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                              >
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
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Clubs Spotlight */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">Community</span>
          <h2 className="text-3xl font-black mt-3 tracking-tight uppercase">Active Club Directory</h2>
          <p className="text-slate-400 text-xs mt-2">Connect with student organizations driving development, arts, music, and dramatic performances.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hardcodedClubs.map((club) => (
            <div
              key={club.id}
              className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-red-500/30 transition-all duration-500 group h-[290px]"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={club.image}
                    alt={club.name}
                    className="w-16 h-16 rounded-full border-2 border-red-500 object-cover shadow-[0_0_15px_rgba(239,68,68,0.2)] group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 rounded-full bg-red-500/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-red-500 transition-colors">{club.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Organizer: {club.organizer}</p>
                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">{club.desc}</p>
              </div>

              <Link
                to={`/clubs`}
                className="mt-5 w-full bg-white/5 text-slate-300 group-hover:bg-red-600 group-hover:text-white py-2 rounded-xl text-center text-xs font-bold border border-white/5 group-hover:border-red-500 transition-all duration-300"
              >
                Explore Club
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/clubs")}
            className="px-6 py-2.5 rounded-full border border-white/10 hover:border-red-500/50 hover:bg-white/5 text-xs text-slate-400 hover:text-white font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
          >
            Browse All Clubs
            <ArrowRight size={12} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-neutral-950/60 border-t border-white/5 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-2 text-white font-bold mb-4">
            <span className="text-red-500">UEvents</span>
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            <span>University Event Hub</span>
          </div>
          <p>© {new Date().getFullYear()} Chitkara University. All rights reserved.</p>
        </div>
      </footer>

      {/* Modal Render */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] animate-scale-up relative">
            
            {/* Close Button */}
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition z-10 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Left Column: Event details */}
            <div className="w-full md:w-1/2 relative bg-black/40 border-b md:border-b-0 md:border-r border-white/10 flex flex-col h-60 md:h-auto overflow-y-auto scrollbar-none">
              {selectedEvent.image ? (
                <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-44 md:h-56 object-cover" />
              ) : (
                <div className={`h-44 md:h-56 flex items-center justify-center bg-gradient-to-br ${getEventCategory(selectedEvent).gradient} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>
                  <CategoryIcon name={getEventCategory(selectedEvent).icon} size={64} className={`${getEventCategory(selectedEvent).color} opacity-80 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`} />
                </div>
              )}
              
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${getEventCategory(selectedEvent).border} ${getEventCategory(selectedEvent).color} mb-3`}>
                    {getEventCategory(selectedEvent).name}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white leading-tight">{selectedEvent.title}</h2>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">{selectedEvent.description || "No description provided."}</p>
                </div>
                
                <div className="mt-6 space-y-3 border-t border-white/5 pt-4 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selectedEvent.date || "TBA"}</p>
                      <p className="text-[10px] text-slate-400">{selectedEvent.time || "Time TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selectedEvent.location || "Campus"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-red-500" />
                    <div>
                      <p className="font-semibold text-white">{selectedEvent.attendees || 0} Registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: details or registration form */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-black/20 overflow-y-auto max-h-[calc(90vh-15rem)] md:max-h-full">
              {modalType === "details" ? (
                <div className="flex flex-col justify-center h-full">
                  <h3 className="text-xl font-bold text-white mb-2">Event Registration</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Registration is open for this event! Verify your details and sync them with the student portal to reserve your seat.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => openRegistration(selectedEvent)}
                      disabled={modalRegistered}
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        modalRegistered 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default" 
                          : "glass-button text-white"
                      }`}
                    >
                      {modalRegistered ? (
                        <>
                          <Check size={14} />
                          Already Registered
                        </>
                      ) : (
                        "Open Registration Form"
                      )}
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full py-3 rounded-xl font-bold text-xs border border-white/10 hover:border-white/20 hover:bg-white/5 transition text-slate-300 hover:text-white cursor-pointer text-center"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              ) : registrationSuccess ? (
                <div className="flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-400 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <Check size={28} className="animate-scale-up" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Registration Confirmed!</h3>
                  <p className="text-slate-400 mt-2 text-xs max-w-xs leading-relaxed">
                    You are now registered for <strong>{selectedEvent.title}</strong>. Your profile details have been synced.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Student Registration</h3>
                      <button onClick={() => setModalType("details")} className="text-[10px] font-bold text-red-500 hover:underline">
                        Back to Details
                      </button>
                    </div>
                    <p className="text-slate-400 text-[10px] mb-5">Verify or complete your details to join this event.</p>

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

export default Home;
