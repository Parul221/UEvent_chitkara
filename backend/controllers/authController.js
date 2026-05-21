const User = require("../models/User");
const Otp = require("../models/Otp");
const generateOtp = require("../utils/generateOtp");
const sendOtpMail = require("../utils/sendOtpMail");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

/* =========================
   REGISTER (NEW - SAFE)
========================= */
exports.register = async (req, res) => {
  try {
    const { name, userId, department, email, password } = req.body;

    if (!name || !userId || !department || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // check if already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = await User.create({
      name,
      userId,
      department,
      email,
      password,
      isVerified: false
    });

    return res.status(201).json({
      message: "Registration successful. Please login."
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

    let user = await User.findOne({ email });

    // 👉 auto create if not exists (OTP flow)
    if (!user) {
      user = await User.create({
        email,
        isVerified: false
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email });

    await Otp.create({
      email,
      otp,
      expiresAt
    });

    await sendOtpMail(email, otp);

    return res.status(200).json({
      message: "OTP sent to your email"
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

    const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

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

    await User.findOneAndUpdate(
      { email },
      { isVerified: true }
    );

    await Otp.deleteMany({ email });

    const token = jwt.sign(
      { email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "OTP verification failed",
      error: error.message
    });
  }
};