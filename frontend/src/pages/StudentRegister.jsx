import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BackButton from "../components/BackButton";
import { saveStudentSession } from "../utils/studentProfile";

export default function StudentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    userId: "",
    department: "CSE",
    group: "",
    semester: "",
    year: "",
    residence: "Hosteller",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.userId ||
      !form.email ||
      !form.password
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/register", form);
      saveStudentSession({ user: res.data.user });
      await API.post("/auth/login", { email: form.email });

      alert("Registration saved. OTP sent to your email.");
      navigate("/otp", { replace: true, state: { email: form.email } });

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Registration failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <BackButton className="fixed left-4 top-4 z-50" />
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Student Register</h2>

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          />

          <input
            name="userId"
            placeholder="Student ID"
            value={form.userId}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          >
            <option value="CSE">CSE</option>
            <option value="AI">AI</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="ELECTRONICS">ELECTRONICS</option>
          </select>

          <input
            name="group"
            placeholder="Group / Section"
            value={form.group}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          />

          <div className="flex gap-4">
            <input
              name="semester"
              placeholder="Semester"
              value={form.semester}
              onChange={handleChange}
              className="w-full glass-input rounded-md px-4 py-2 text-white"
            />

            <input
              name="year"
              placeholder="Year"
              value={form.year}
              onChange={handleChange}
              className="w-full glass-input rounded-md px-4 py-2 text-white"
            />
          </div>

          <select
            name="residence"
            value={form.residence}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          >
            <option>Hosteller</option>
            <option>Day Scholar</option>
          </select>

          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-2 text-white"
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full glass-button rounded-md py-3 font-bold text-white mt-4"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p
          className="mt-6 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
          onClick={() => navigate("/login")}
        >
          Already registered? Login
        </p>

      </div>
    </div>
  );
}
