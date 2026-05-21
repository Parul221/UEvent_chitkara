import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import { Search, Sparkles, User, ArrowRight } from "lucide-react";

// Import local images
import img1 from "../assets/1.jpeg";
import img2 from "../assets/2.jpeg";
import img3 from "../assets/3.jpeg";
import img4 from "../assets/4.jpeg";

const clubsData = [
  {
    id: 1,
    name: "Music Club",
    organizer: "Rahul Sharma",
    image: img1,
    desc: "A vibrant home for campus instrumentalists, vocalists, and music enthusiasts. We organize open mics and concerts."
  },
  {
    id: 2,
    name: "Dance Club",
    organizer: "Priya Singh",
    image: img2,
    desc: "Bringing rhythm and energy to campus with street dance, classical, and fusion. Join for annual fest choreography."
  },
  {
    id: 3,
    name: "Tech Club",
    organizer: "Ankit Verma",
    image: img3,
    desc: "Focusing on competitive programming, app/web dev, robotics, and campus hackathons. Let's build the future."
  },
  {
    id: 4,
    name: "Art Club",
    organizer: "Neha Gupta",
    image: img4,
    desc: "Fostering visual creativity through painting, sculpture, sketching, graphic design, and exhibition galleries."
  }
];

const Clubs = () => {
  const [query, setQuery] = useState("");

  const filteredClubs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubsData;
    return clubsData.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.organizer.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10">
        <BackButton className="mb-6" />

        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
              Student Directory
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-4 tracking-tight uppercase text-white">
              Campus Clubs
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              Explore specialized interest groups, connect with active student leaders, and find your community on campus.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative flex items-center w-full lg:w-80">
            <Search size={14} className="absolute left-3.5 text-slate-500" />
            <input
              placeholder="Search clubs by name or focus..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-3 text-xs text-white border border-white/10 focus:border-red-500/50 outline-none"
            />
          </div>
        </header>

        {filteredClubs.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <Sparkles size={40} className="text-slate-600 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">No Clubs Found</h3>
            <p className="text-slate-500 text-xs mt-1">Try resetting your search parameter filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="glass-panel border border-white/5 hover:border-red-500/20 rounded-2xl p-5 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  {/* Round Image with Glow Container */}
                  <div className="flex justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-red-600/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-red-500/35 group-hover:border-red-500 transition-colors duration-300 relative z-10"
                    />
                  </div>

                  {/* Club Name */}
                  <h2 className="text-lg font-bold text-white text-center group-hover:text-red-500 transition-colors duration-200 uppercase tracking-tight">
                    {club.name}
                  </h2>
                  
                  {/* Organizer Name */}
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 text-xs font-semibold">
                    <User size={12} className="text-red-500" />
                    <span>{club.organizer}</span>
                  </div>

                  {/* Club Description */}
                  <p className="text-slate-400 text-xs mt-4 leading-relaxed text-center line-clamp-3">
                    {club.desc}
                  </p>
                </div>

                {/* View Details Button */}
                <Link
                  to={`/clubs/${club.id}`}
                  className="mt-6 glass-button text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Explore Club
                  <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 bg-neutral-950/60 border-t border-white/5 text-center text-slate-500 text-xs mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Chitkara University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Clubs;
