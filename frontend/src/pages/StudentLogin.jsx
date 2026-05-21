import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import BackButton from "../components/BackButton";
import { saveStudentProfile } from "../utils/studentProfile";

export default function StudentLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email) {
      alert("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: form.email
      });

      saveStudentProfile(res.data.user);
      alert(res.data.message); // OTP sent
      navigate("/otp", { replace: true, state: { email: form.email } });

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <BackButton className="fixed left-4 top-4 z-50" />
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-6">Student Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full glass-input rounded-md px-4 py-3 text-white"
          />

          <button 
            type="submit" 
            disabled={loading}
            className="w-full glass-button rounded-md py-3 font-bold text-white mt-4"
          >
            {loading ? "Sending OTP..." : "Login"}
          </button>
        </form>

        <p
          className="mt-6 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
          onClick={() => navigate("/register")}
        >
          New user? Register
        </p>

      </div>
    </div>
  );
}
