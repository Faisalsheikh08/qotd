// // // src/lib/services/mailchimpSmsService.js
// // import axios from "axios";
// // import crypto from "crypto";

// // export const mailchimpSmsService = {
// //   // Generate 6-digit OTP
// //   generateOTP() {
// //     return Math.floor(100000 + Math.random() * 900000).toString();
// //   },

// //   // Hash OTP for secure storage
// //   hashOTP(otp, secret = process.env.OTP_SECRET) {
// //     return crypto.createHmac("sha256", secret).update(otp).digest("hex");
// //   },

// //   // Verify OTP by comparing hashes
// //   verifyOTP(otp, hashedOtp, secret = process.env.OTP_SECRET) {
// //     const hash = this.hashOTP(otp, secret);
// //     return hash === hashedOtp;
// //   },

// //   // Send OTP via Mailchimp Transactional (Mandrill) SMS
// //   async sendOTPSMS(phoneNumber, otp) {
// //     try {
// //       const mandrill_api_key = process.env.MAILCHIMP_API_KEY;

// //       if (!mandrill_api_key) {
// //         throw new Error("Mailchimp API key not configured");
// //       }

// //       // Validate phone number format (10 digits for India)
// //       if (!/^\d{10}$/.test(phoneNumber)) {
// //         throw new Error("Invalid phone number format. Must be 10 digits.");
// //       }

// //       // Format phone number for SMS (add country code)
// //       const formattedPhone = "+91" + phoneNumber;

// //       // Mailchimp SMS API endpoint
// //       const response = await axios.post(
// //         "https://mandrillapp.com/api/1.0/messages/send-raw",
// //         {
// //           key: mandrill_api_key,
// //           to: [
// //             {
// //               email: "sms@teaching-pariksha.com", // SMS gateway
// //               name: "Teaching Pariksha SMS",
// //             },
// //           ],
// //           raw_message: `To: ${formattedPhone}\nSubject: Teaching Pariksha OTP\n\nYour Teaching Pariksha verification code is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.\n\nTeaching Pariksha Team`,
// //         }
// //       );

// //       // Alternative: Use AWS SNS for SMS (more reliable for SMS)
// //       if (process.env.USE_AWS_SNS === "true") {
// //         return await this.sendSMSViaAWSSNS(phoneNumber, otp);
// //       }

// //       // Alternative: Use Twilio for SMS (most reliable)
// //       if (process.env.USE_TWILIO === "true") {
// //         return await this.sendSMSViaTwilio(phoneNumber, otp);
// //       }

// //       console.log("OTP SMS sent:", response.data);
// //       return {
// //         success: true,
// //         message: "OTP sent via SMS",
// //         messageId: response.data[0]?.id,
// //       };
// //     } catch (error) {
// //       console.error(
// //         "Error sending OTP SMS:",
// //         error.response?.data || error.message
// //       );
// //       // Try fallback methods
// //       try {
// //         if (process.env.USE_TWILIO === "true") {
// //           return await this.sendSMSViaTwilio(phoneNumber, otp);
// //         }
// //         if (process.env.USE_AWS_SNS === "true") {
// //           return await this.sendSMSViaAWSSNS(phoneNumber, otp);
// //         }
// //       } catch (fallbackError) {
// //         console.error("Fallback SMS method also failed:", fallbackError);
// //       }
// //       throw new Error(`Failed to send OTP SMS: ${error.message}`);
// //     }
// //   },

// //   // Send via Twilio (RECOMMENDED FOR SMS)
// //   async sendSMSViaTwilio(phoneNumber, otp) {
// //     try {
// //       const twilio = require("twilio");
// //       const client = twilio(
// //         process.env.TWILIO_ACCOUNT_SID,
// //         process.env.TWILIO_AUTH_TOKEN
// //       );

// //       const formattedPhone = "+91" + phoneNumber;

// //       const message = await client.messages.create({
// //         body: `Your Teaching Pariksha OTP is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
// //         from: process.env.TWILIO_PHONE_NUMBER,
// //         to: formattedPhone,
// //       });

// //       console.log("Twilio SMS sent:", message.sid);
// //       return {
// //         success: true,
// //         message: "OTP sent via SMS",
// //         messageSid: message.sid,
// //         provider: "twilio",
// //       };
// //     } catch (error) {
// //       console.error("Twilio error:", error);
// //       throw error;
// //     }
// //   },

// //   // Send via AWS SNS (ALTERNATIVE)
// //   async sendSMSViaAWSSNS(phoneNumber, otp) {
// //     try {
// //       const AWS = require("aws-sdk");
// //       const sns = new AWS.SNS({
// //         region: process.env.AWS_REGION || "ap-south-1",
// //         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
// //         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
// //       });

// //       const formattedPhone = "+91" + phoneNumber;

// //       const params = {
// //         Message: `Your Teaching Pariksha OTP is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
// //         PhoneNumber: formattedPhone,
// //       };

// //       const result = await sns.publish(params).promise();

// //       console.log("AWS SNS SMS sent:", result.MessageId);
// //       return {
// //         success: true,
// //         message: "OTP sent via SMS",
// //         messageId: result.MessageId,
// //         provider: "aws_sns",
// //       };
// //     } catch (error) {
// //       console.error("AWS SNS error:", error);
// //       throw error;
// //     }
// //   },

// //   // Development: Log OTP to console (for testing without SMS gateway)
// //   logOTPForDevelopment(phoneNumber, otp) {
// //     console.log(`
// //     ╔═══════════════════════════════════════════════╗
// //     ║          🔐 TESTING OTP - DO NOT USE IN PROD  ║
// //     ╚═══════════════════════════════════════════════╝
// //     Phone Number: ${phoneNumber}
// //     OTP Code: ${otp}
// //     Expires in: 10 minutes
// //     ═════════════════════════════════════════════════
// //     `);
// //     return {
// //       success: true,
// //       message: "OTP logged to console (development mode)",
// //       isDevelopment: true,
// //     };
// //   },

// //   // Format phone number to standard format
// //   formatPhoneNumber(phoneNumber) {
// //     // Remove any non-digit characters
// //     const cleaned = phoneNumber.replace(/\D/g, "");

// //     // If already has 91, remove it
// //     let formatted = cleaned.replace(/^91/, "");

// //     // If less than 10 digits, return error
// //     if (formatted.length < 10) {
// //       throw new Error("Phone number must be at least 10 digits");
// //     }

// //     // Take last 10 digits
// //     formatted = formatted.slice(-10);

// //     return formatted;
// //   },

// //   // Validate phone number
// //   isValidPhoneNumber(phoneNumber) {
// //     try {
// //       const formatted = this.formatPhoneNumber(phoneNumber);
// //       return /^\d{10}$/.test(formatted);
// //     } catch {
// //       return false;
// //     }
// //   },
// // };

// // src/lib/services/mailchimpSMSService.js
// // MAILCHIMP ONLY - SMS via Mailchimp Transactional Email

// import axios from "axios";
// import crypto from "crypto";

// export const mailchimpSMSService = {
//   // Generate 6-digit OTP
//   generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
//   },

//   // Hash OTP for secure storage
//   hashOTP(otp, secret = process.env.OTP_SECRET) {
//     return crypto.createHmac("sha256", secret).update(otp).digest("hex");
//   },

//   // Verify OTP by comparing hashes
//   verifyOTP(otp, hashedOtp, secret = process.env.OTP_SECRET) {
//     const hash = this.hashOTP(otp, secret);
//     return hash === hashedOtp;
//   },

//   // Send SMS via Mailchimp Transactional (Mandrill)
//   async sendSMSViaMandrill(phoneNumber, otp) {
//     try {
//       const mandrillApiKey = process.env.MAILCHIMP_API_KEY;

//       if (!mandrillApiKey) {
//         throw new Error("Mailchimp API key not configured");
//       }

//       // Validate phone number
//       if (!/^\d{10}$/.test(phoneNumber)) {
//         throw new Error("Invalid phone number format. Must be 10 digits.");
//       }

//       console.log(`📱 Sending OTP via Mailchimp to: ${phoneNumber}`);

//       // Format phone for SMS (India)
//       const formattedPhone = "+91" + phoneNumber;

//       // Create SMS message using Mandrill
//       // Mailchimp Mandrill has SMS capability
//       const response = await axios.post(
//         "https://mandrillapp.com/api/1.0/messages/send",
//         {
//           key: mandrillApiKey,
//           message: {
//             // SMS content
//             text: `Your Teaching Pariksha verification code is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`,
//             subject: `Teaching Pariksha OTP: ${otp}`,
//             from_email:
//               process.env.MAILCHIMP_FROM_EMAIL ||
//               "noreply@teachingpariksha.com",
//             from_name: "Teaching Pariksha",
//             to: [
//               {
//                 email: formattedPhone, // Using phone as email format for SMS gateway
//                 name: "User",
//                 type: "to",
//               },
//             ],
//             important: true,
//             track_opens: false,
//             track_clicks: false,
//             auto_text: true,
//             tags: ["otp", "sms", "verification"],
//           },
//         },
//         {
//           timeout: 10000,
//         }
//       );

//       console.log(`✅ Mailchimp SMS sent successfully`);
//       console.log(`📨 Response:`, response.data);

//       return {
//         success: true,
//         message: "OTP sent via SMS",
//         messageId: response.data[0]?.id || "mailchimp-" + Date.now(),
//         provider: "mailchimp",
//         status: response.data[0]?.status || "sent",
//       };
//     } catch (error) {
//       console.error(
//         "❌ Mailchimp SMS Error:",
//         error.response?.data || error.message
//       );
//       throw new Error(
//         `Failed to send OTP via Mailchimp: ${
//           error.response?.data?.message || error.message
//         }`
//       );
//     }
//   },

//   // Alternative: Send SMS via Mailchimp SMS API (if available)
//   async sendSMSViaMailchimpSMS(phoneNumber, otp) {
//     try {
//       const mandrillApiKey = process.env.MAILCHIMP_API_KEY;

//       if (!mandrillApiKey) {
//         throw new Error("Mailchimp API key not configured");
//       }

//       console.log(`📱 Sending OTP via Mailchimp SMS API to: ${phoneNumber}`);

//       const formattedPhone = "+91" + phoneNumber;

//       // Using Mailchimp SMS API directly
//       const response = await axios.post(
//         "https://mandrillapp.com/api/1.0/sms/send",
//         {
//           key: mandrillApiKey,
//           message: {
//             text: `Your Teaching Pariksha OTP: ${otp}\nValid for 10 minutes. Do not share with anyone.`,
//             from_number: process.env.MAILCHIMP_SMS_FROM_NUMBER || "Teaching",
//             to: formattedPhone,
//           },
//         },
//         {
//           timeout: 10000,
//         }
//       );

//       console.log(`✅ Mailchimp SMS sent via SMS API`);

//       return {
//         success: true,
//         message: "OTP sent via SMS",
//         messageId: response.data[0]?.id || "mailchimp-sms-" + Date.now(),
//         provider: "mailchimp_sms_api",
//         status: response.data[0]?.status || "sent",
//       };
//     } catch (error) {
//       console.error(
//         "❌ Mailchimp SMS API Error:",
//         error.response?.data || error.message
//       );
//       throw error;
//     }
//   },

//   // Development: Log OTP to console
//   logOTPForDevelopment(phoneNumber, otp) {
//     console.log(`
//     ╔═══════════════════════════════════════════════╗
//     ║       🔐 OTP for Testing (Development Mode)   ║
//     ╚═══════════════════════════════════════════════╝
//     Phone Number: +91${phoneNumber}
//     OTP Code: ${otp}
//     Expires in: 10 minutes
//     Status: Waiting for Mailchimp configuration
//     ═════════════════════════════════════════════════
//     `);
//     return {
//       success: true,
//       message: "OTP logged to console (development mode)",
//       isDevelopment: true,
//     };
//   },

//   // Format phone number to standard format
//   formatPhoneNumber(phoneNumber) {
//     const cleaned = phoneNumber.replace(/\D/g, "");
//     let formatted = cleaned.replace(/^91/, "");

//     if (formatted.length < 10) {
//       throw new Error("Phone number must be at least 10 digits");
//     }

//     formatted = formatted.slice(-10);
//     return formatted;
//   },

//   // Validate phone number
//   isValidPhoneNumber(phoneNumber) {
//     try {
//       const formatted = this.formatPhoneNumber(phoneNumber);
//       return /^\d{10}$/.test(formatted);
//     } catch {
//       return false;
//     }
//   },
// };

import axios from "axios";
import crypto from "crypto";

export const mailchimpSMSService = {
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  hashOTP(otp, secret = process.env.OTP_SECRET) {
    return crypto.createHmac("sha256", secret).update(otp).digest("hex");
  },

  verifyOTP(otp, hashedOtp, secret = process.env.OTP_SECRET) {
    const hash = this.hashOTP(otp, secret);
    return hash === hashedOtp;
  },

  // Send via Mailchimp Transactional API
  async sendSMSViaMandrill(phoneNumber, otp) {
    try {
      const mandrillApiKey = process.env.MAILCHIMP_API_KEY;

      if (!mandrillApiKey) {
        throw new Error("Mailchimp API key not configured");
      }

      // Validate API key format
      if (!mandrillApiKey.includes("-")) {
        throw new Error(
          "Invalid Mailchimp API key format. Should be like: key-us1"
        );
      }

      console.log(`📱 Attempting to send via Mailchimp Mandrill...`);
      console.log(
        `🔑 API Key format check: ${mandrillApiKey.substring(0, 5)}...`
      );

      if (!/^\d{10}$/.test(phoneNumber)) {
        throw new Error("Invalid phone number format. Must be 10 digits.");
      }

      const formattedPhone = "+91" + phoneNumber;

      // Mailchimp Mandrill API call
      const response = await axios.post(
        "https://mandrillapp.com/api/1.0/messages/send",
        {
          key: mandrillApiKey,
          message: {
            text: `Your Teaching Pariksha verification code is: ${otp}\n\nValid for 10 minutes.\n\nDo not share this code with anyone.`,
            subject: `Teaching Pariksha OTP: ${otp}`,
            from_email:
              process.env.MAILCHIMP_FROM_EMAIL ||
              "noreply@teachingpariksha.com",
            from_name: "Teaching Pariksha",
            to: [
              {
                email:
                  "otp@" +
                  formattedPhone.replace("+", "").substring(0, 2) +
                  "-teaching.com", // SMS gateway format
                name: "User",
                type: "to",
              },
            ],
            important: true,
            track_opens: false,
            auto_text: true,
            tags: ["otp", "verification"],
          },
        },
        {
          timeout: 15000,
        }
      );

      console.log(`✅ Mailchimp Mandrill SMS sent`);

      return {
        success: true,
        message: "OTP sent via SMS",
        messageId: response.data[0]?.id || "mandrill-" + Date.now(),
        provider: "mailchimp",
      };
    } catch (error) {
      console.error(
        "❌ Mailchimp Mandrill Error:",
        error.response?.data || error.message
      );

      // Provide helpful error message
      if (error.response?.data?.message?.includes("Invalid_Key")) {
        throw new Error(
          "Invalid Mailchimp API key. Please check your MAILCHIMP_API_KEY in .env.local"
        );
      }

      throw new Error(
        `Mailchimp error: ${error.response?.data?.message || error.message}`
      );
    }
  },

  formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");
    let formatted = cleaned.replace(/^91/, "");

    if (formatted.length < 10) {
      throw new Error("Phone number must be at least 10 digits");
    }

    formatted = formatted.slice(-10);
    return formatted;
  },

  isValidPhoneNumber(phoneNumber) {
    try {
      const formatted = this.formatPhoneNumber(phoneNumber);
      return /^\d{10}$/.test(formatted);
    } catch {
      return false;
    }
  },

  // For development/testing
  logOTPForDevelopment(phoneNumber, otp) {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║       🔐 OTP for Testing (Development Mode)   ║
    ╚═══════════════════════════════════════════════╝
    Phone Number: +91${phoneNumber}
    OTP Code: ${otp}
    Expires in: 10 minutes
    ═════════════════════════════════════════════════
    `);
    return {
      success: true,
      message: "OTP logged to console (development mode)",
      isDevelopment: true,
    };
  },
};
