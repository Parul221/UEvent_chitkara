import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import BackButton from "../components/BackButton";
import { saveStudentSession } from "../utils/studentProfile";

export default function Otp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move to next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      alert("Enter complete OTP");
      return;
    }

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: finalOtp
      });

      saveStudentSession(res.data.token, res.data.user);

      alert("OTP verified");
      navigate("/", { replace: true });

    } catch (error) {
      alert(error.response?.data?.message || "OTP failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BackButton className="fixed left-4 top-4 z-50" />
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl text-center">
        <h2 className="text-3xl font-bold text-white mb-2">OTP Verification</h2>
        <p className="text-gray-300 mb-6">Enter OTP sent to your email</p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="w-12 h-14 glass-input rounded-lg text-center text-xl text-white font-bold"
              />
            ))}
          </div>

          <button type="submit" className="w-full glass-button rounded-md py-3 font-bold text-white">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
}
