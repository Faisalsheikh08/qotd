// // // src/app/api/auth/send-sms-otp/route.js
// // import { NextResponse } from "next/server";
// // import connectDB from "@/lib/db/connection";
// // import SMSVerification from "@/lib/db/models/SMSVerification";
// // import { mailchimpSmsService } from "@/lib/services/mailchimpSMSService";
// // import User from "@/lib/db/models/User";

// // function getClientIP(request) {
// //   return (
// //     request.headers.get("x-forwarded-for")?.split(",")[0] ||
// //     request.headers.get("x-real-ip") ||
// //     "unknown"
// //   );
// // }

// // export async function POST(request) {
// //   try {
// //     await connectDB();

// //     const body = await request.json();
// //     let { phoneNumber } = body;

// //     // Validation
// //     if (!phoneNumber) {
// //       return NextResponse.json(
// //         { success: false, message: "Phone number is required" },
// //         { status: 400 }
// //       );
// //     }

// //     // Format and validate phone number
// //     try {
// //       phoneNumber = mailchimpSmsService.formatPhoneNumber(phoneNumber);
// //     } catch (error) {
// //       return NextResponse.json(
// //         { success: false, message: error.message },
// //         { status: 400 }
// //       );
// //     }

// //     // Check rate limiting - max 3 OTP requests per hour per phone
// //     const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
// //     const recentAttempts = await SMSVerification.countDocuments({
// //       phoneNumber,
// //       createdAt: { $gte: oneHourAgo },
// //       status: "sent",
// //     });

// //     if (recentAttempts >= 3) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Too many OTP requests. Try again after 1 hour.",
// //         },
// //         { status: 429 }
// //       );
// //     }

// //     // Check if phone is already verified with another account
// //     const existingUser = await User.findOne({
// //       "googleProfile.phone": phoneNumber,
// //       phoneNoVerified: true,
// //     });

// //     if (existingUser) {
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "This phone number is already registered. Please login.",
// //         },
// //         { status: 400 }
// //       );
// //     }

// //     // Generate OTP
// //     const otp = mailchimpSmsService.generateOTP();
// //     const hashedOtp = mailchimpSmsService.hashOTP(otp);
// //     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
// //     const clientIP = getClientIP(request);
// //     const userAgent = request.headers.get("user-agent") || "unknown";

// //     // Delete old unverified OTP records for this phone
// //     await SMSVerification.deleteMany({
// //       phoneNumber,
// //       status: "pending",
// //     });

// //     // Save OTP to database
// //     const smsRecord = await SMSVerification.create({
// //       phoneNumber,
// //       otp: hashedOtp,
// //       expiresAt,
// //       attempts: 0,
// //       status: "sent",
// //       ipAddress: clientIP,
// //       userAgent,
// //     });

// //     // Send OTP via SMS
// //     let smsResult;
// //     try {
// //       if (process.env.NODE_ENV === "development") {
// //         // Development: Log to console
// //         smsResult = mailchimpSmsService.logOTPForDevelopment(phoneNumber, otp);
// //       } else {
// //         // Production: Send via Twilio or AWS SNS
// //         if (process.env.USE_TWILIO === "true") {
// //           smsResult = await mailchimpSmsService.sendSMSViaTwilio(
// //             phoneNumber,
// //             otp
// //           );
// //         } else if (process.env.USE_AWS_SNS === "true") {
// //           smsResult = await mailchimpSmsService.sendSMSViaAWSSNS(
// //             phoneNumber,
// //             otp
// //           );
// //         } else {
// //           smsResult = await mailchimpSmsService.sendOTPSMS(phoneNumber, otp);
// //         }
// //       }
// //     } catch (smsError) {
// //       console.error("SMS sending error:", smsError);
// //       // Delete the record if SMS fails
// //       await SMSVerification.deleteOne({ _id: smsRecord._id });
// //       return NextResponse.json(
// //         {
// //           success: false,
// //           message: "Failed to send OTP. Please try again.",
// //         },
// //         { status: 500 }
// //       );
// //     }

// //     // Update SMS record with provider info
// //     smsRecord.provider = smsResult.provider || "mailchimp";
// //     smsRecord.externalMessageId = smsResult.messageSid || smsResult.messageId;
// //     await smsRecord.save();

// //     return NextResponse.json(
// //       {
// //         success: true,
// //         message: "OTP sent successfully to your mobile",
// //         smsId: smsRecord._id,
// //         expiresIn: 600, // 10 minutes in seconds
// //         phoneNumber: phoneNumber, // Return formatted number for display
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     console.error("Send SMS OTP error:", error);
// //     return NextResponse.json(
// //       {
// //         success: false,
// //         message: error.message || "Failed to send OTP",
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // ============================================================

// // src/app/api/auth/send-sms-otp/route.js (MAILCHIMP ONLY)
// import { NextResponse } from "next/server";
// import connectDB from "@/lib/db/connection";
// import SMSVerification from "@/lib/db/models/SMSVerification";
// import { mailchimpSMSService } from "@/lib/services/mailchimpSMSService";
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
//     let { phoneNumber } = body;

//     console.log("📞 SMS OTP Request received via Mailchimp");

//     // Validation
//     if (!phoneNumber) {
//       return NextResponse.json(
//         { success: false, message: "Phone number is required" },
//         { status: 400 }
//       );
//     }

//     // Format and validate phone number
//     try {
//       phoneNumber = mailchimpSMSService.formatPhoneNumber(phoneNumber);
//       console.log(`✅ Phone formatted: ${phoneNumber}`);
//     } catch (error) {
//       console.log(`❌ Phone validation error: ${error.message}`);
//       return NextResponse.json(
//         { success: false, message: error.message },
//         { status: 400 }
//       );
//     }

//     // Check rate limiting - max 3 OTP requests per hour per phone
//     const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
//     const recentAttempts = await SMSVerification.countDocuments({
//       phoneNumber,
//       createdAt: { $gte: oneHourAgo },
//       status: "sent",
//     });

//     if (recentAttempts >= 3) {
//       console.log(`⚠️ Rate limit exceeded for: ${phoneNumber}`);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Too many OTP requests. Try again after 1 hour.",
//         },
//         { status: 429 }
//       );
//     }

//     // Check if phone is already verified with another account
//     const existingUser = await User.findOne({
//       "googleProfile.phone": phoneNumber,
//       phoneNoVerified: true,
//     });

//     if (existingUser) {
//       console.log(`⚠️ Phone already verified: ${phoneNumber}`);
//       return NextResponse.json(
//         {
//           success: false,
//           message: "This phone number is already registered. Please login.",
//         },
//         { status: 400 }
//       );
//     }

//     // Generate OTP
//     const otp = mailchimpSMSService.generateOTP();
//     console.log(`🔐 OTP Generated: ${otp}`);

//     const hashedOtp = mailchimpSMSService.hashOTP(otp);
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//     const clientIP = getClientIP(request);
//     const userAgent = request.headers.get("user-agent") || "unknown";

//     // Delete old unverified OTP records for this phone
//     await SMSVerification.deleteMany({
//       phoneNumber,
//       status: "pending",
//     });

//     // Save OTP to database
//     const smsRecord = await SMSVerification.create({
//       phoneNumber,
//       otp: hashedOtp,
//       expiresAt,
//       attempts: 0,
//       status: "sent",
//       ipAddress: clientIP,
//       userAgent,
//     });

//     console.log(`💾 SMS record saved to DB: ${smsRecord._id}`);

//     // Send OTP via Mailchimp
//     let smsResult;
//     try {
//       console.log(`📱 Sending OTP via Mailchimp...`);

//       // Try Mailchimp SMS API first
//       try {
//         smsResult = await mailchimpSMSService.sendSMSViaMailchimpSMS(
//           phoneNumber,
//           otp
//         );
//         console.log(`✅ Sent via Mailchimp SMS API`);
//       } catch (smsApiError) {
//         console.log(`⚠️ SMS API failed, trying Mandrill...`);
//         // Fallback to Mandrill
//         smsResult = await mailchimpSMSService.sendSMSViaMandrill(
//           phoneNumber,
//           otp
//         );
//         console.log(`✅ Sent via Mailchimp Mandrill`);
//       }
//     } catch (smsError) {
//       console.error("❌ Mailchimp sending error:", smsError.message);
//       await SMSVerification.deleteOne({ _id: smsRecord._id });

//       // In development mode, log OTP to console
//       if (process.env.NODE_ENV === "development") {
//         console.log(`\n⚠️ Mailchimp not configured. OTP logged to console.`);
//         mailchimpSMSService.logOTPForDevelopment(phoneNumber, otp);

//         // Still save and return success for testing
//         smsRecord.provider = "development";
//         await smsRecord.save();

//         return NextResponse.json(
//           {
//             success: true,
//             message: "OTP ready (development mode - check server logs)",
//             smsId: smsRecord._id,
//             expiresIn: 600,
//             phoneNumber,
//             testOTP: otp, // Only in development
//           },
//           { status: 200 }
//         );
//       }

//       return NextResponse.json(
//         {
//           success: false,
//           message: `Failed to send OTP: ${smsError.message}`,
//         },
//         { status: 500 }
//       );
//     }

//     // Update SMS record with provider info
//     smsRecord.provider = smsResult.provider || "mailchimp";
//     smsRecord.externalMessageId = smsResult.messageId;
//     await smsRecord.save();

//     console.log(`✅ OTP request completed successfully for: ${phoneNumber}\n`);

//     return NextResponse.json(
//       {
//         success: true,
//         message: "OTP sent successfully to your mobile",
//         smsId: smsRecord._id,
//         expiresIn: 600, // 10 minutes in seconds
//         phoneNumber: phoneNumber,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("❌ Send SMS OTP error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Failed to send OTP",
//       },
//       { status: 500 }
//     );
//   }
// }

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
    let { phoneNumber } = body;

    console.log("\n📞 SMS OTP Request received");

    // Validation
    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format and validate phone number
    try {
      phoneNumber = mailchimpSMSService.formatPhoneNumber(phoneNumber);
      console.log(`✅ Phone formatted: ${phoneNumber}`);
    } catch (error) {
      console.log(`❌ Phone validation error: ${error.message}`);
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    // Check rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await SMSVerification.countDocuments({
      phoneNumber,
      createdAt: { $gte: oneHourAgo },
      status: "sent",
    });

    if (recentAttempts >= 3) {
      console.log(`⚠️ Rate limit exceeded for: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "Too many OTP requests. Try again after 1 hour.",
        },
        { status: 429 }
      );
    }

    // Check if phone already verified
    const existingUser = await User.findOne({
      "googleProfile.phone": phoneNumber,
      phoneNoVerified: true,
    });

    if (existingUser) {
      console.log(`⚠️ Phone already verified: ${phoneNumber}`);
      return NextResponse.json(
        {
          success: false,
          message: "This phone number is already registered. Please login.",
        },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = mailchimpSMSService.generateOTP();
    console.log(`🔐 OTP Generated: ${otp}`);

    const hashedOtp = mailchimpSMSService.hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Delete old unverified OTP records
    await SMSVerification.deleteMany({
      phoneNumber,
      status: "pending",
    });

    // Save OTP to database
    const smsRecord = await SMSVerification.create({
      phoneNumber,
      otp: hashedOtp,
      expiresAt,
      attempts: 0,
      status: "sent",
      ipAddress: clientIP,
      userAgent,
      provider: "mailchimp", // FIXED: Set proper provider
    });

    console.log(`💾 SMS record saved to DB`);

    // Try to send via Mailchimp
    let smsResult;
    try {
      console.log(`📱 Sending OTP via Mailchimp Mandrill...`);
      smsResult = await mailchimpSMSService.sendSMSViaMandrill(
        phoneNumber,
        otp
      );
      console.log(`✅ Mailchimp SMS sent successfully`);
    } catch (smsError) {
      console.error(`❌ Mailchimp Error: ${smsError.message}`);

      // In development, show OTP in console
      if (process.env.NODE_ENV === "development") {
        console.log(`\n⚠️ Mailchimp not configured. Showing OTP in console:\n`);
        mailchimpSMSService.logOTPForDevelopment(phoneNumber, otp);

        // Update provider to "development"
        smsRecord.provider = "mock"; // FIXED: Use "mock" instead of "development"
        await smsRecord.save();

        return NextResponse.json(
          {
            success: true,
            message: "OTP logged to console (development mode)",
            smsId: smsRecord._id,
            expiresIn: 600,
            phoneNumber,
            testOTP: otp, // Only for development
          },
          { status: 200 }
        );
      }

      // Production: return error
      await SMSVerification.deleteOne({ _id: smsRecord._id });
      return NextResponse.json(
        {
          success: false,
          message: smsError.message,
        },
        { status: 500 }
      );
    }

    // Update SMS record
    smsRecord.provider = smsResult.provider || "mailchimp";
    smsRecord.externalMessageId = smsResult.messageId;
    await smsRecord.save();

    console.log(`✅ OTP request completed successfully\n`);

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully to your mobile",
        smsId: smsRecord._id,
        expiresIn: 600,
        phoneNumber: phoneNumber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Send SMS OTP error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
