import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config/api";
import { saveStudentProfile, saveStudentSession } from "../utils/studentProfile";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SEND OTP
  const sendOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP");
        return;
      }

      if (data.user) {
        saveStudentProfile(data.user);
      }
      setOtpSent(true);
      alert("OTP sent to your email!");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const verifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!otp) {
      setError("Enter OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "OTP verification failed");
        return;
      }

      saveStudentSession(data.token, data.user);

      alert("Login Successful!");

      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <div className="glass-panel p-10 rounded-2xl w-full max-w-md">

        <h2 className="text-3xl font-extrabold text-center mb-2 text-white">
          Student Login
        </h2>

        <p className="text-center text-gray-300 font-semibold mb-6">
          OTP Authentication
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        {!otpSent ? (
          <form onSubmit={sendOtp} className="space-y-4">

            <input
              type="email"
              placeholder="Enter Email"
              className="w-full glass-input p-3 rounded-lg text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button text-white py-3 rounded-lg font-bold"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full glass-input p-3 rounded-lg text-white"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full glass-button text-white py-3 rounded-lg font-bold bg-green-600/90 hover:bg-green-500 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>
        )}

        <p className="text-center text-gray-400 mt-6 text-sm">
          Don't have an account?{" "}
          <Link
            className="text-white hover:text-red-400 font-semibold transition-colors"
            to="/register"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
