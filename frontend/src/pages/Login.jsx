import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

      const res = await fetch("http://localhost:5000/api/auth/login", {
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

      const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
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

      // SAVE TOKEN
      localStorage.setItem("studentToken", data.token);

      if (data.user) {
        localStorage.setItem("studentInfo", JSON.stringify(data.user));
      }

      alert("Login Successful!");

      navigate("/events");
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-red-700 rounded-full blur-[160px] opacity-30"></div>

      <div className="bg-[#0f0f0f]/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md border border-red-700/40">

        <h2 className="text-3xl font-extrabold text-center mb-4 text-white">
          Student Login
        </h2>

        <p className="text-center text-red-500 font-semibold mb-6">
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
              className="w-full p-3 border border-gray-700 bg-[#111] text-white rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-700 text-white py-3 rounded-lg font-bold"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">

            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border border-gray-700 bg-[#111] text-white rounded-lg"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

          </form>
        )}

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            className="text-red-500 hover:text-red-400 font-semibold underline"
            to="/register"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}