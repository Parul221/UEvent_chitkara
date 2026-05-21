import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import { User, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

// Local images
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
    desc: "A vibrant home for campus instrumentalists, vocalists, and music enthusiasts. We organize open mics, jam sessions, and annual concerts."
  },
  {
    id: 2,
    name: "Dance Club",
    organizer: "Priya Singh",
    image: img2,
    desc: "Bringing rhythm and energy to campus with street dance, classical, and fusion styles. Join us for annual fest choreographies and workshops."
  },
  {
    id: 3,
    name: "Tech Club",
    organizer: "Ankit Verma",
    image: img3,
    desc: "Focusing on competitive programming, app/web development, cutting-edge robotics, and campus hackathons. Let's build the future together."
  },
  {
    id: 4,
    name: "Art Club",
    organizer: "Neha Gupta",
    image: img4,
    desc: "Fostering visual creativity through painting, sculpture, sketching, graphic design, and exhibition galleries on campus."
  }
];

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const club = clubsData.find((c) => c.id === parseInt(id));

  if (!club) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <ShieldAlert size={40} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold uppercase tracking-tight">Club Not Found</h2>
        <button onClick={() => navigate("/clubs")} className="mt-4 glass-button px-6 py-2.5 rounded-xl text-xs font-bold text-white">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 relative z-10 flex flex-col items-center justify-center">
        <BackButton className="self-start mb-6" />

        <div className="w-full glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 text-center animate-scale-up relative">
          
          {/* Round Header Image */}
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 w-28 h-28 bg-red-600/10 rounded-full blur-lg mx-auto"></div>
            <img
              src={club.image}
              alt={club.name}
              className="w-28 h-28 rounded-full object-cover border-2 border-red-500 relative z-10 shadow-lg"
            />
          </div>

          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
            Club Profile
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 uppercase tracking-tight">{club.name}</h1>
          
          {/* Organizer Card */}
          <div className="flex items-center justify-center gap-2 mt-3 bg-white/5 border border-white/5 px-4 py-2 rounded-2xl max-w-xs mx-auto text-slate-300 text-xs font-semibold">
            <User size={14} className="text-red-500" />
            <span>Organizer: <strong className="text-white font-bold">{club.organizer}</strong></span>
          </div>

          <div className="my-8 border-t border-white/5 pt-8 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
              <BookOpen size={14} className="text-red-500" />
              <span>About the Club</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {club.desc}
            </p>
          </div>

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
            >
              Back to Clubs
            </button>
            
            <button
              onClick={() => navigate(`/events?search=${encodeURIComponent(club.name)}`)}
              className="glass-button text-white px-6 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              View Live Events
            </button>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 bg-neutral-950/60 border-t border-white/5 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Chitkara University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClubDetails;
