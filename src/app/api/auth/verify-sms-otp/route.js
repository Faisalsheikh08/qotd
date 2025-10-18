// // src/app/api/auth/verify-sms-otp/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db/connection";
// import SMSVerification from "@/lib/db/models/SMSVerification";
// import { mailchimpSmsService } from "@/lib/services/mailchimpSMSService";
// import User from "@/lib/db/models/User";

// function getClientIP(request) {
//   return (
//     request.headers.get("x-forwarded-for")?.split(",")[0] ||
//     request.headers.get("x-real-ip") ||
//     "unknown"
//   );
// }

// export async function POST(request) {
//   try {
//     await connectDB();

//     const body = await request.json();
//     let { phoneNumber, otp } = body;

//     // Validation
//     if (!phoneNumber || !otp) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Phone number and OTP are required",
//         },
//         { status: 400 }
//       );
//     }

//     // Format phone number
//     try {
//       phoneNumber = mailchimpSmsService.formatPhoneNumber(phoneNumber);
//     } catch (error) {
//       return NextResponse.json(
//         { success: false, message: error.message },
//         { status: 400 }
//       );
//     }

//     // Validate OTP format (6 digits)
//     if (!/^\d{6}$/.test(otp)) {
//       return NextResponse.json(
//         { success: false, message: "OTP must be 6 digits" },
//         { status: 400 }
//       );
//     }

//     // Find OTP record
//     const smsRecord = await SMSVerification.findOne({
//       phoneNumber,
//       status: "sent",
//       expiresAt: { $gt: new Date() }, // Not expired
//     }).select("+otp");

//     if (!smsRecord) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "OTP expired or not found. Request a new one.",
//         },
//         { status: 400 }
//       );
//     }

//     // Check max attempts (3 attempts)
//     if (smsRecord.attempts >= 3) {
//       smsRecord.status = "failed";
//       await smsRecord.save();

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Max attempts exceeded. Request a new OTP.",
//         },
//         { status: 400 }
//       );
//     }

//     // Verify OTP
//     const isValid = mailchimpSmsService.verifyOTP(otp, smsRecord.otp);

//     if (!isValid) {
//       smsRecord.attempts += 1;
//       await smsRecord.save();

//       return NextResponse.json(
//         {
//           success: false,
//           message: "Invalid OTP",
//           attemptsRemaining: 3 - smsRecord.attempts,
//         },
//         { status: 400 }
//       );
//     }

//     // OTP verified successfully
//     smsRecord.status = "verified";
//     smsRecord.verifiedAt = new Date();
//     smsRecord.verifiedIp = getClientIP(request);
//     await smsRecord.save();

//     // Update user record if exists
//     let user = await User.findOne({ "googleProfile.phone": phoneNumber });

//     if (user) {
//       user.phoneNoVerified = true;
//       user.phoneVerifiedAt = new Date();
//       await user.save();
//     }

//     // Generate or update temporary session token for registration flow
//     const tempToken = require("crypto").randomBytes(32).toString("hex");

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Phone number verified successfully",
//         phoneNumber,
//         tempToken, // For frontend to use during registration
//         verified: true,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Verify SMS OTP error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to verify OTP" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/auth/verify-sms-otp/route.js (MAILCHIMP VERSION)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import SMSVerification from "@/lib/db/models/SMSVerification";
import { mailchimpSMSService } from "@/lib/services/mailchimpSMSService";
import User from "@/lib/db/models/User";

function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    let { phoneNumber, otp } = body;

    console.log(`🔍 OTP Verification request for: ${phoneNumber}`);

    // Validation
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and OTP are required",
        },
        { status: 400 }
      );
    }

    // Format phone number
    try {
      phoneNumber = mailchimpSMSService.formatPhoneNumber(phoneNumber);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      console.log(`❌ Invalid OTP format: ${otp}`);
      return NextResponse.json(
        { success: false, message: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    // Find OTP record
    const smsRecord = await SMSVerification.findOne({
      phoneNumber,
      status: "sent",
      expiresAt: { $gt: new Date() }, // Not expired
    }).select("+otp");

    if (!smsRecord) {
      console.log(`❌ OTP record not found or expired for: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "OTP expired or not found. Request a new one.",
        },
        { status: 400 }
      );
    }

    // Check max attempts (3 attempts)
    if (smsRecord.attempts >= 3) {
      smsRecord.status = "failed";
      await smsRecord.save();

      console.log(`❌ Max attempts exceeded for: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "Max attempts exceeded. Request a new OTP.",
        },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = mailchimpSMSService.verifyOTP(otp, smsRecord.otp);

    if (!isValid) {
      smsRecord.attempts += 1;
      await smsRecord.save();

      console.log(`❌ Invalid OTP. Attempts: ${smsRecord.attempts}`);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
          attemptsRemaining: 3 - smsRecord.attempts,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully
    smsRecord.status = "verified";
    smsRecord.verifiedAt = new Date();
    smsRecord.verifiedIp = getClientIP(request);
    await smsRecord.save();

    console.log(`✅ OTP verified successfully for: ${phoneNumber}`);

    // Update user record if exists
    let user = await User.findOne({ "googleProfile.phone": phoneNumber });

    if (user) {
      user.phoneNoVerified = true;
      user.phoneVerifiedAt = new Date();
      await user.save();
      console.log(`✅ User phone marked as verified`);
    }

    // Generate temporary token
    const tempToken = require("crypto").randomBytes(32).toString("hex");

    return NextResponse.json(
      {
        success: true,
        message: "Phone number verified successfully",
        phoneNumber,
        tempToken,
        verified: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Verify SMS OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
