const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("../utils/generateOtp");
const sendOtpMail = require("../utils/sendOtpMail");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const bcrypt = require("bcryptjs");

function toStudentProfile(user) {
  if (!user) return null;
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: source._id,
    name: source.name || "",
    userId: source.userId || "",
    department: source.department || "CSE",
    group: source.group || "",
    semester: source.semester || "",
    year: source.year || "",
    residence: source.residence || "",
    email: source.email || "",
    isVerified: Boolean(source.isVerified),
  };
}

function signStudentToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: "student" },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

/* =========================
   REGISTER (NEW - SAFE)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, userId, department, email, password, group, semester, year, residence } = req.body;

    if (!name || !userId || !department || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // check if already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing && existing.password && existing.name && existing.userId) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const payload = {
      name,
      userId,
      department,
      group: group || "",
      semester: semester || "",
      year: year || "",
      residence: residence || "",
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: true
    };

    let savedUser;
    if (existing) {
      savedUser = await User.findByIdAndUpdate(existing._id, payload, { new: true });
    } else {
      savedUser = await User.create(payload);
    }

    const token = signStudentToken(savedUser);

    return res.status(201).json({
      message: "Registration successful.",
      token,
      user: toStudentProfile(savedUser)
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};


/* =========================
   LOGIN OR REGISTER + SEND OTP
========================= */
exports.loginOrRegister = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    // 👉 auto create if not exists (OTP flow)
    if (!user) {
      user = await User.create({
        email: normalizedEmail,
        isVerified: false
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email: normalizedEmail });

    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt
    });

    await sendOtpMail(normalizedEmail, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
      user: toStudentProfile(user)
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
};


/* =========================
   VERIFY OTP + JWT
========================= */
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required"
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found"
      });
    }

    if (otpRecord.otp !== String(otp)) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      { isVerified: true },
      { new: true }
    );

    await Otp.deleteMany({ email: normalizedEmail });

    const token = signStudentToken(user);

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      user: toStudentProfile(user)
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "Profile not found" });

    return res.json({ user: toStudentProfile(user) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "userId", "department", "group", "semester", "year", "residence"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findOneAndUpdate(
      { email: req.user.email },
      updates,
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "Profile not found" });

    return res.json({
      message: "Profile updated",
      user: toStudentProfile(user)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};
