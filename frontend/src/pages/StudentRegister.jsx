import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./StudentRegister.css";

export default function StudentRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    userId: "",
    department: "CSE",
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

      alert(res.data.message); // backend message
      navigate("/login");

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
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Student Register</h2>

        <form onSubmit={handleRegister}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="userId"
            placeholder="Student ID"
            value={form.userId}
            onChange={handleChange}
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
          >
            <option value="CSE">CSE</option>
            <option value="AI">AI</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="ELECTRONICS">ELECTRONICS</option>
          </select>

          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p
          className="link-text"
          onClick={() => navigate("/login")}
        >
          Already registered? Login
        </p>

        <p
          className="link-text"
          onClick={() => navigate("/")}
        >
          ← Back
        </p>
      </div>
    </div>
  );
}
