require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/event_manager";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: String,
  time: String,
  location: String,
  attendees: { type: Number, default: 0 },
  description: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const Event = mongoose.model("Event", eventSchema);

const events = [
  {
    title: "Tech Innovation Summit",
    date: "2026-06-05",
    time: "10:00 AM",
    location: "Main Auditorium",
    attendees: 120,
    description: "A campus-wide summit featuring student projects, startup ideas, and expert talks.",
    image: "",
  },
  {
    title: "Photography Walk",
    date: "2026-06-08",
    time: "4:30 PM",
    location: "Campus Garden",
    attendees: 45,
    description: "A guided outdoor photography session for beginners and enthusiasts.",
    image: "",
  },
  {
    title: "CodeSprint Challenge",
    date: "2026-06-12",
    time: "11:00 AM",
    location: "Computer Lab 2",
    attendees: 80,
    description: "A competitive coding event with problem-solving rounds and team challenges.",
    image: "",
  },
  {
    title: "Cultural Night",
    date: "2026-06-15",
    time: "6:00 PM",
    location: "Open Air Theatre",
    attendees: 250,
    description: "An evening of music, dance, drama, and student performances.",
    image: "",
  },
  {
    title: "Entrepreneurship Bootcamp",
    date: "2026-06-20",
    time: "1:00 PM",
    location: "Seminar Hall B",
    attendees: 60,
    description: "Hands-on sessions on pitching, product thinking, and building a startup roadmap.",
    image: "",
  },
  {
    title: "Sports Meet",
    date: "2026-06-25",
    time: "9:00 AM",
    location: "Sports Ground",
    attendees: 180,
    description: "Inter-department sports competitions including athletics, football, and volleyball.",
    image: "",
  },
];

async function seedEvents() {
  try {
    await mongoose.connect(MONGO_URI);
    await Event.insertMany(events);
    console.log(`Added ${events.length} events to ${MONGO_URI}`);
  } catch (error) {
    console.error("Failed to seed events:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedEvents();
