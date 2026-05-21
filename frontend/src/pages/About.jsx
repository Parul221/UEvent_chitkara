import React from "react";
import a1 from "../assets/a1.jpeg";
import a2 from "../assets/a2.jpeg";
import a3 from "../assets/a3.jpeg";
import BackButton from "../components/BackButton";

function About() {
  return (
    <div className="w-full min-h-screen bg-black text-white">
      <div className="px-6 pt-6">
        <BackButton />
      </div>
      {/* Header Section */}
      <section className="glass-panel py-16 text-center mt-12 mx-6 rounded-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">About Campus Event Handler</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto px-4">
          Campus Event Handler is a smart platform designed to organize, manage,
          and promote campus events easily. From cultural fests to technical
          workshops, we bring everything to your fingertips.
        </p>
      </section>

      {/* What is Campus Event Handler */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-3xl font-semibold text-red-500 mb-6">
          What is Campus Event Handler?
        </h2>
        <p className="text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto">
          Campus Event Handler is a one-stop solution for students and
          organizers to manage events efficiently. It helps in scheduling,
          registration, notifications, and engagement for any event happening on
          campus.
        </p>
      </section>

      {/* Why Use It */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-10 text-white">
            Why Use Campus Event Handler?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-3 text-red-500">
                Centralized Management
              </h3>
              <p className="text-gray-300">
                Manage all events in one place — no need for multiple platforms.
              </p>
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-3 text-red-500">
                Easy Registrations
              </h3>
              <p className="text-gray-300">
                Students can register for events in just a few clicks.
              </p>
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <h3 className="text-xl font-bold mb-3 text-red-500">
                Instant Updates
              </h3>
              <p className="text-gray-300">
                Get real-time updates and notifications about upcoming events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-center mb-10 text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-8 glass-card rounded-2xl">
            <span className="text-5xl font-bold text-red-500/80">1</span>
            <h3 className="text-xl font-semibold mt-4 text-white">Organize Events</h3>
            <p className="text-gray-300 mt-2">
              Clubs and departments create events with all details in the app.
            </p>
          </div>
          <div className="p-8 glass-card rounded-2xl">
            <span className="text-5xl font-bold text-red-500/80">2</span>
            <h3 className="text-xl font-semibold mt-4 text-white">Students Register</h3>
            <p className="text-gray-300 mt-2">
              Students explore events and register instantly.
            </p>
          </div>
          <div className="p-8 glass-card rounded-2xl">
            <span className="text-5xl font-bold text-red-500/80">3</span>
            <h3 className="text-xl font-semibold mt-4 text-white">Enjoy the Event</h3>
            <p className="text-gray-300 mt-2">
              Attend the event and get notified of future updates.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-10">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl">
              <img
                src={a1}
                alt="Rahul Sharma"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] object-cover"
              />
              <h3 className="text-xl font-semibold text-white">Rahul Sharma</h3>
              <p className="text-gray-400 mt-1">Project Lead</p>
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <img
                src={a2}
                alt="Priya Singh"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] object-cover"
              />
              <h3 className="text-xl font-semibold text-white">Priya Singh</h3>
              <p className="text-gray-400 mt-1">Full Stack Developer</p>
            </div>
            <div className="glass-card p-8 rounded-2xl">
              <img
                src={a3}
                alt="Aman Verma"
                className="w-24 h-24 mx-auto rounded-full mb-4 border-2 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)] object-cover"
              />
              <h3 className="text-xl font-semibold text-white">Aman Verma</h3>
              <p className="text-gray-400 mt-1">UI/UX Designer</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
