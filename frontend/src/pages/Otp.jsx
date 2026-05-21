import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Otp.css";

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

      localStorage.setItem("token", res.data.token);

      alert("OTP verified");
      navigate("/");

    } catch (error) {
      alert(error.response?.data?.message || "OTP failed");
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2 className="otp-title">OTP Verification</h2>
        <p className="otp-subtitle">Enter OTP sent to your email</p>

        <form onSubmit={handleVerify}>
          <div className="otp-input-group">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
              />
            ))}
          </div>

          <button type="submit">Verify OTP</button>
        </form>
      </div>
    </div>
  );
}