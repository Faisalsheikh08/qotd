// // src/app/api/auth/resend-sms-otp/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db/connection";
// import SMSVerification from "@/lib/db/models/SMSVerification";
// import { mailchimpSmsService } from "@/lib/services/mailchimpSMSService";

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
//     let { phoneNumber } = body;

//     // Format and validate phone number
//     try {
//       phoneNumber = mailchimpSmsService.formatPhoneNumber(phoneNumber);
//     } catch (error) {
//       return NextResponse.json(
//         { success: false, message: error.message },
//         { status: 400 }
//       );
//     }

//     // Find existing OTP record
//     const smsRecord = await SMSVerification.findOne({
//       phoneNumber,
//       status: "sent",
//     });

//     if (!smsRecord) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "No active OTP found. Request a new one.",
//         },
//         { status: 400 }
//       );
//     }

//     // Check if still valid (not expired)
//     if (smsRecord.expiresAt < new Date()) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "OTP expired. Please request a new one.",
//         },
//         { status: 400 }
//       );
//     }

//     // Generate new OTP
//     const otp = mailchimpSmsService.generateOTP();
//     const hashedOtp = mailchimpSmsService.hashOTP(otp);

//     // Update record
//     smsRecord.otp = hashedOtp;
//     smsRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
//     smsRecord.attempts = 0;
//     smsRecord.resendCount = (smsRecord.resendCount || 0) + 1;
//     await smsRecord.save();

//     // Send new OTP
//     try {
//       if (process.env.NODE_ENV === "development") {
//         mailchimpSmsService.logOTPForDevelopment(phoneNumber, otp);
//       } else {
//         if (process.env.USE_TWILIO === "true") {
//           await mailchimpSmsService.sendSMSViaTwilio(phoneNumber, otp);
//         } else if (process.env.USE_AWS_SNS === "true") {
//           await mailchimpSmsService.sendSMSViaAWSSNS(phoneNumber, otp);
//         } else {
//           await mailchimpSmsService.sendOTPSMS(phoneNumber, otp);
//         }
//       }
//     } catch (smsError) {
//       console.error("Resend OTP error:", smsError);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Failed to resend OTP. Please try again.",
//         },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: true,
//         message: "OTP resent successfully",
//         expiresIn: 600,
//         resendCount: smsRecord.resendCount,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Resend SMS OTP error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to resend OTP" },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/auth/resend-sms-otp/route.js (MAILCHIMP VERSION)
import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import SMSVerification from "@/lib/db/models/SMSVerification";
import { mailchimpSMSService } from "@/lib/services/mailchimpSMSService";

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
    let { phoneNumber } = body;

    console.log(`🔄 Resend OTP request for: ${phoneNumber}`);

    // Format and validate phone number
    try {
      phoneNumber = mailchimpSMSService.formatPhoneNumber(phoneNumber);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Find existing OTP record
    const smsRecord = await SMSVerification.findOne({
      phoneNumber,
      status: "sent",
    });

    if (!smsRecord) {
      console.log(`❌ No active OTP found for: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "No active OTP found. Request a new one.",
        },
        { status: 400 }
      );
    }

    // Check if still valid (not expired)
    if (smsRecord.expiresAt < new Date()) {
      console.log(`❌ Existing OTP expired for: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "OTP expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otp = mailchimpSMSService.generateOTP();
    const hashedOtp = mailchimpSMSService.hashOTP(otp);

    console.log(`🔐 New OTP Generated: ${otp}`);

    // Update record
    smsRecord.otp = hashedOtp;
    smsRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    smsRecord.attempts = 0;
    smsRecord.resendCount = (smsRecord.resendCount || 0) + 1;
    await smsRecord.save();

    console.log(`💾 SMS record updated with new OTP`);

    // Send new OTP via Mailchimp
    try {
      console.log(`📱 Resending OTP via Mailchimp...`);

      try {
        await mailchimpSMSService.sendSMSViaMailchimpSMS(phoneNumber, otp);
      } catch {
        await mailchimpSMSService.sendSMSViaMandrill(phoneNumber, otp);
      }

      console.log(`✅ OTP resent successfully`);
    } catch (smsError) {
      console.error("❌ Resend error:", smsError.message);

      if (process.env.NODE_ENV === "development") {
        mailchimpSMSService.logOTPForDevelopment(phoneNumber, otp);
        return NextResponse.json(
          {
            success: true,
            message: "OTP ready (development mode - check logs)",
            expiresIn: 600,
            resendCount: smsRecord.resendCount,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Failed to resend OTP: ${smsError.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "OTP resent successfully",
        expiresIn: 600,
        resendCount: smsRecord.resendCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Resend SMS OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to resend OTP" },
      { status: 500 }
    );
  }
}
