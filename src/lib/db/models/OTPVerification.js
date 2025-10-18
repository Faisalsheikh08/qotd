// src/lib/db/models/OTPVerification.js
import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Invalid phone number format"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      select: false, // Don't expose OTP in queries
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 600 }, // Auto-delete after 10 minutes
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient cleanup
otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpVerificationSchema.index({ phoneNumber: 1, email: 1 });

// Static method to create OTP record
otpVerificationSchema.statics.createOTPRecord = async function (
  phoneNumber,
  email,
  hashedOtp,
  ipAddress = null,
  userAgent = null
) {
  // Delete existing unverified OTP for this number
  await this.deleteMany({
    phoneNumber,
    verified: false,
  });

  return this.create({
    phoneNumber,
    email,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    ipAddress,
    userAgent,
  });
};

// Method to check if OTP is valid and not expired
otpVerificationSchema.methods.isValid = function () {
  return new Date() < this.expiresAt && this.attempts < 3;
};

const OTPVerification =
  mongoose.models.OTPVerification ||
  mongoose.model("OTPVerification", otpVerificationSchema);

export default OTPVerification;
