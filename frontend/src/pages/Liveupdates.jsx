
import React, { useEffect, useState } from "react";
import { API_BASE, WS_URL } from "../config/api";
import BackButton from "../components/BackButton";

const Liveupdates = () => {
  const [updates, setUpdates] = useState([]);
  const [status, setStatus] = useState("Connecting...");
  const [form, setForm] = useState({ event: "", update: "" });
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("clubToken");

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      setStatus("Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (Array.isArray(data)) {
          setUpdates(data.reverse());
        } else {
          setUpdates((prev) => [data, ...prev]);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("Error");
    };

    socket.onclose = () => {
      console.log("❌ Disconnected from WebSocket server");
      setStatus("Disconnected");
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const res = await fetch(`${API_BASE}/api/updates`);
        const data = await res.json();
        if (Array.isArray(data)) setUpdates([...data].reverse());
      } catch (err) {
        console.error("Could not load updates:", err);
      }
    }
    loadUpdates();
  }, []);

  async function submitUpdate(e) {
    e.preventDefault();
    setMessage("");
    if (!token) {
      setMessage("Club login is required to post an update.");
      return;
    }
    if (!form.event.trim() || !form.update.trim()) {
      setMessage("Event and update text are required.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/add-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not post update.");
        return;
      }
      setForm({ event: "", update: "" });
      setMessage("Update posted.");
    } catch (err) {
      console.error("Update post error:", err);
      setMessage("Network error while posting update.");
    }
  }

  return (
    <div className="p-6 font-sans min-h-screen text-white">
      <BackButton className="mb-6" />
      <h2 className="text-3xl font-bold text-red-500 mb-4 flex items-center gap-2">
        📢 Live Event Updates
      </h2>
      <p className="mb-6">
        Status: <span className="font-semibold">{status}</span>
      </p>

      <form onSubmit={submitUpdate} className="mb-8 max-w-3xl glass-panel rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-4">
        <input
          value={form.event}
          onChange={(e) => setForm((s) => ({ ...s, event: e.target.value }))}
          placeholder="Event name"
          className="glass-input rounded-md px-4 py-2 w-full text-white"
        />
        <input
          value={form.update}
          onChange={(e) => setForm((s) => ({ ...s, update: e.target.value }))}
          placeholder="Update message"
          className="glass-input rounded-md px-4 py-2 w-full text-white"
        />
        <button className="glass-button rounded-md px-6 py-2 font-semibold">
          Post
        </button>
        {message && <p className="md:col-span-3 text-sm text-red-300">{message}</p>}
      </form>

      <div className="space-y-4">
        {updates.length === 0 ? (
          <p className="text-gray-400">No updates yet...</p>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className="glass-card border-red-500/30 rounded-xl p-5 shadow-lg"
            >
              <strong className="text-red-400">{update.event || "Event"}:</strong>{" "}
              <span className="text-white">{update.update || update.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Liveupdates;
