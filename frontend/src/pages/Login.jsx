// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = formData;
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save token + student info
      localStorage.setItem("studentToken", data.token);
      localStorage.setItem("studentInfo", JSON.stringify(data.student));

      // redirect
      navigate("/events", { replace: true });
    } catch (err) {
      console.error("Network error", err);
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-red-700 rounded-full blur-[160px] opacity-30"></div>
      <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-red-700/40 transition hover:shadow-red-600/30 hover:border-red-600/60">
        <h2 className="text-3xl font-extrabold text-center mb-4 text-white tracking-wide">Student Login</h2>
        <p className="text-center text-red-500 font-semibold mb-6">Campus Event Handler</p>

        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-900/20 p-2 rounded">{error}</p>}

        <form onSubmit={submit} className="space-y-4">
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-700 bg-[#111] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-700 bg-[#111] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-700 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-600 transition shadow-lg hover:shadow-red-600/40 disabled:bg-red-900 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account?{" "}
          <Link className="text-red-500 hover:text-red-400 font-semibold underline" to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}