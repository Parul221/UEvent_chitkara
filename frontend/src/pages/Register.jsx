import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    department: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.rollNumber ||
      !formData.department ||
      !formData.year ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Enter a valid email address.");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Registration Successful!");
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2 text-white">
          Student Registration
        </h2>
        <p className="text-center text-gray-300 font-semibold mb-6">Campus Event Handler</p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.rollNumber}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.department}
            onChange={handleChange}
          />

          <select
            name="year"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full glass-input p-3 rounded-lg text-white"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full glass-button text-white py-3 rounded-lg font-bold mt-2"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:text-red-400 font-semibold transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
