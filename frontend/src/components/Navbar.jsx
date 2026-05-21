import React, { useState, useEffect } from "react";
import { Bell, Menu, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Import your logo
import { getStoredStudent } from "../utils/studentProfile";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgBlack, setBgBlack] = useState(false);
  const navigate = useNavigate();
  const student = getStoredStudent();

  const handleScroll = () => {
    setBgBlack(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCloseMenu = () => setIsOpen(false);

  const handleClubsClick = () => {
    navigate("/clubs");
    setIsOpen(false);
  };

  const handleBellClick = () => {
    navigate("/live-updates");
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        bgBlack ? "bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg" : "bg-transparent"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Heading */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-10 w-10 mr-3 object-contain transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col justify-center leading-none">
              <h1 className="text-lg font-black text-red-500 tracking-wider leading-none">UEvents</h1>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">University Event Hub</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/events" className="text-sm font-semibold text-slate-300 hover:text-red-500 transition-colors duration-300">
              Events
            </Link>

            <Link to="/clubs" className="text-sm font-semibold text-slate-300 hover:text-red-500 transition-colors duration-300">
              Clubs
            </Link>

            <Link to="/about" className="text-sm font-semibold text-slate-300 hover:text-red-500 transition-colors duration-300">
              About
            </Link>

            <Link
              to="/club-login"
              className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white hover:border-red-500/50 hover:bg-red-600/10 transition-all duration-300"
            >
              Club Login
            </Link>

            <Link
              to={student ? "/profile" : "/login"}
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center justify-center border border-red-400/40 shadow-[0_0_10px_rgba(220,38,38,0.2)]"
              title={student ? "Student profile" : "Student login"}
              aria-label={student ? "Student profile" : "Student login"}
            >
              {student?.name ? (
                <span className="font-bold text-sm text-white">{student.name.slice(0, 1).toUpperCase()}</span>
              ) : (
                <User size={18} className="text-white" />
              )}
            </Link>

            {/* Desktop Bell Button */}
            <button
              className="relative p-2 text-slate-300 hover:text-red-500 hover:scale-105 transition"
              onClick={handleBellClick}
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-red-500 focus:outline-none transition"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 text-white px-5 py-4 space-y-3.5 animate-fade-in">
          <Link to="/events" className="block text-sm font-semibold text-slate-300 hover:text-red-500" onClick={handleCloseMenu}>
            Events
          </Link>

          <Link to="/clubs" className="block text-sm font-semibold text-slate-300 hover:text-red-500" onClick={handleCloseMenu}>
            Clubs
          </Link>

          <Link to="/about" className="block text-sm font-semibold text-slate-300 hover:text-red-500" onClick={handleCloseMenu}>
            About
          </Link>

          <div className="border-t border-white/5 pt-3.5 flex flex-col gap-3">
            <Link
              to="/club-login"
              className="inline-block text-center border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-white/5 transition"
              onClick={handleCloseMenu}
            >
              Club Login
            </Link>

            <div className="flex items-center justify-between">
              <Link
                to={student ? "/profile" : "/login"}
                className="flex items-center gap-2.5"
                onClick={handleCloseMenu}
              >
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center border border-red-400/40">
                  {student?.name ? (
                    <span className="font-bold text-sm text-white">{student.name.slice(0, 1).toUpperCase()}</span>
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
                <span className="text-xs text-slate-300 font-semibold">{student?.name || "Login as Student"}</span>
              </Link>

              <button
                className="relative p-2 text-slate-300 hover:text-red-500"
                onClick={handleBellClick}
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
