// // src/lib/db/models/SMSVerification.js
// import mongoose from "mongoose";

// const smsVerificationSchema = new mongoose.Schema(
//   {
//     phoneNumber: {
//       type: String,
//       required: [true, "Phone number is required"],
//       match: [/^\d{10}$/, "Invalid phone number format"],
//       index: true,
//       lowercase: true,
//     },
//     otp: {
//       type: String,
//       required: [true, "OTP is required"],
//       select: false, // Don't expose OTP in queries
//     },
//     expiresAt: {
//       type: Date,
//       required: true,
//       index: { expireAfterSeconds: 0 }, // Auto-delete after expiry
//     },
//     status: {
//       type: String,
//       enum: ["pending", "sent", "verified", "failed"],
//       default: "sent",
//       index: true,
//     },
//     attempts: {
//       type: Number,
//       default: 0,
//       min: 0,
//       max: 3,
//     },
//     resendCount: {
//       type: Number,
//       default: 0,
//       max: 2,
//     },
//     verifiedAt: {
//       type: Date,
//       default: null,
//     },
//     // Device and network info
//     ipAddress: {
//       type: String,
//       trim: true,
//     },
//     userAgent: {
//       type: String,
//       trim: true,
//     },
//     verifiedIp: {
//       type: String,
//       trim: true,
//       default: null,
//     },
//     provider: {
//       type: String,
//       enum: ["twilio", "aws_sns", "mailchimp"],
//       default: "twilio",
//     },
//     externalMessageId: {
//       type: String,
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// smsVerificationSchema.index({ phoneNumber: 1, status: 1 });
// smsVerificationSchema.index({ expiresAt: 1 });
// smsVerificationSchema.index({ createdAt: -1 });

// // TTL Index - auto-delete after 24 hours
// smsVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// // Static method to check if OTP is valid
// smsVerificationSchema.statics.isOTPValid = async function (phoneNumber) {
//   const record = await this.findOne({
//     phoneNumber,
//     status: "sent",
//     expiresAt: { $gt: new Date() },
//   });

//   return record ? true : false;
// };

// // Static method to get OTP attempts
// smsVerificationSchema.statics.getAttempts = async function (phoneNumber) {
//   const record = await this.findOne({
//     phoneNumber,
//     status: "sent",
//   });

//   return record ? record.attempts : 0;
// };

// // Static method to mark as verified
// smsVerificationSchema.statics.markVerified = async function (
//   phoneNumber,
//   ipAddress
// ) {
//   const record = await this.findOneAndUpdate(
//     { phoneNumber, status: "sent" },
//     {
//       status: "verified",
//       verifiedAt: new Date(),
//       verifiedIp: ipAddress,
//     },
//     { new: true }
//   );

//   return record;
// };

// // Static method to mark as failed
// smsVerificationSchema.statics.markFailed = async function (phoneNumber) {
//   await this.findOneAndUpdate(
//     { phoneNumber, status: "sent" },
//     { status: "failed" },
//     { new: true }
//   );
// };

// // Instance method to check if verification attempts exceeded
// smsVerificationSchema.methods.exceededAttempts = function () {
//   return this.attempts >= 3;
// };

// // Instance method to check if OTP is expired
// smsVerificationSchema.methods.isExpired = function () {
//   return new Date() > this.expiresAt;
// };

// // Instance method to get remaining attempts
// smsVerificationSchema.methods.getRemainingAttempts = function () {
//   return Math.max(0, 3 - this.attempts);
// };

// // Instance method to get time remaining
// smsVerificationSchema.methods.getTimeRemaining = function () {
//   const now = new Date();
//   if (now > this.expiresAt) return 0;
//   return Math.ceil((this.expiresAt - now) / 1000); // in seconds
// };

// const SMSVerification =
//   mongoose.models.SMSVerification ||
//   mongoose.model("SMSVerification", smsVerificationSchema);

// export default SMSVerification;

import mongoose from "mongoose";

const smsVerificationSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\d{10}$/, "Invalid phone number format"],
      index: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, "OTP is required"],
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    status: {
      type: String,
      enum: ["pending", "sent", "verified", "failed"],
      default: "sent",
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    resendCount: {
      type: Number,
      default: 0,
      max: 2,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    verifiedIp: {
      type: String,
      trim: true,
      default: null,
    },
    provider: {
      type: String,
      // FIXED: Added "development" and "mock" to accepted values
      enum: ["mailchimp", "twilio", "aws_sns", "development", "mock"],
      default: "mailchimp",
    },
    externalMessageId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
smsVerificationSchema.index({ phoneNumber: 1, status: 1 });
smsVerificationSchema.index({ expiresAt: 1 });
smsVerificationSchema.index({ createdAt: -1 });

// TTL Index - auto-delete after 24 hours
smsVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const SMSVerification =
  mongoose.models.SMSVerification ||
  mongoose.model("SMSVerification", smsVerificationSchema);

export default SMSVerification;
