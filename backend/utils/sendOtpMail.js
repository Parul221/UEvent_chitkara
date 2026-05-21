const transporter = require("../config/mail");

const sendOtpMail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for Login",
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `
  });
};

module.exports = sendOtpMail;
