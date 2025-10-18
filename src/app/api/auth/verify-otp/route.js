// src/app/api/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import OTPVerification from "@/lib/db/models/OTPVerification";
import { mailchimpService } from "@/lib/services/mailchimpService";
import User from "@/lib/db/models/User";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { phoneNumber, otp } = body;

    // Validation
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Find OTP record
    const otpRecord = await OTPVerification.findOne({
      phoneNumber,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: "OTP not found or expired" },
        { status: 400 }
      );
    }

    // Check max attempts (3 attempts)
    if (otpRecord.attempts >= 3) {
      await OTPVerification.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: "Max attempts exceeded. Request new OTP" },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = mailchimpService.verifyOTP(otp, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
          attemptsRemaining: 3 - otpRecord.attempts,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    await OTPVerification.deleteOne({ _id: otpRecord._id });

    // Mark phone as verified in user record (if user exists)
    const user = await User.findOne({ email: otpRecord.email });
    if (user) {
      user.phoneNoVerified = true;
      user.googleProfile.phone = phoneNumber;
      await user.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Phone number verified successfully",
        phoneNumber,
        email: otpRecord.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
