import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./StudentLogin.css";

export default function StudentLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""   // keeping this (no removal, safe)
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // ✅ FIX: only check email (NOT password)
    if (!form.email) {
      alert("Email is required");
      return;
    }

    try {
      setLoading(true);

      // ✅ FIX: send ONLY email (backend expects this)
      const res = await API.post("/auth/login", {
        email: form.email
      });

      alert(res.data.message); // OTP sent
      navigate("/otp", { state: { email: form.email } });

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Student Login</h2>

        <form onSubmit={handleLogin}>
          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          {/* ✅ kept password field (no breaking UI) */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Sending OTP..." : "Login"}
          </button>
        </form>

        <p
          className="link-text"
          onClick={() => navigate("/register")}
        >
          New user? Register
        </p>

        <p
          className="link-text"
          onClick={() => navigate("/student")}
        >
          ← Back
        </p>
      </div>
    </div>
  );
}