const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ""   // ✅ removed required
  },
  userId: {
    type: String,
    default: ""   // ✅ removed required
  },
  department: {
    type: String,
    enum: ["CSE", "AI", "MECHANICAL", "ELECTRONICS"],
    default: "CSE"   // ✅ safe default
  },
  group: {
    type: String,
    default: ""
  },
  semester: {
    type: String,
    default: ""
  },
  year: {
    type: String,
    default: ""
  },
  residence: {
    type: String,
    enum: ["Hosteller", "Day Scholar", ""],
    default: ""
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: ""   // ✅ not used in OTP flow
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
