// src/lib/services/mailchimpService.js
import axios from "axios";
import crypto from "crypto";

export const mailchimpService = {
  // Generate 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Hash OTP for secure storage
  hashOTP(otp, secret = process.env.OTP_SECRET) {
    return crypto.createHmac("sha256", secret).update(otp).digest("hex");
  },

  // Verify OTP by comparing hashes
  verifyOTP(otp, hashedOtp, secret = process.env.OTP_SECRET) {
    const hash = this.hashOTP(otp, secret);
    return hash === hashedOtp;
  },

  // Send OTP via Mailchimp Transactional (Mandrill)
  async sendOTPEmail(email, otp, phoneNumber = null) {
    try {
      const mandrill_api_key = process.env.MAILCHIMP_API_KEY;

      if (!mandrill_api_key) {
        throw new Error("Mailchimp API key not configured");
      }

      const response = await axios.post(
        "https://mandrillapp.com/api/1.0/messages/send",
        {
          key: mandrill_api_key,
          message: {
            html: this.getOTPEmailTemplate(otp, phoneNumber),
            text: `Your Teaching Pariksha OTP is: ${otp}. Valid for 10 minutes.`,
            subject: "Your Teaching Pariksha Verification Code",
            from_email:
              process.env.MAILCHIMP_FROM_EMAIL ||
              "noreply@teachingpariksha.com",
            from_name: "Teaching Pariksha",
            to: [
              {
                email: email,
                type: "to",
              },
            ],
            track_opens: true,
            track_clicks: true,
            auto_text: true,
            important: false,
            tags: ["otp-verification"],
            merge_vars: [
              {
                rcpt: email,
                vars: [
                  { name: "OTP", content: otp },
                  { name: "PHONE", content: phoneNumber || "N/A" },
                ],
              },
            ],
          },
        }
      );

      console.log("OTP email sent successfully:", response.data);
      return {
        success: true,
        message: "OTP sent to email",
        messageId: response.data[0]?.id,
      };
    } catch (error) {
      console.error(
        "Error sending OTP email:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  },

  // Send OTP via SMS using Mailchimp or third-party service
  async sendOTPSMS(phoneNumber, otp) {
    try {
      // Option 1: Using AWS SNS
      if (process.env.USE_AWS_SNS === "true") {
        return await this.sendSMSViaSNS(phoneNumber, otp);
      }

      // Option 2: Using Twilio
      if (process.env.USE_TWILIO === "true") {
        return await this.sendSMSViaTwilio(phoneNumber, otp);
      }

      // Fallback: Log for development
      console.log(`[DEV] SMS OTP for ${phoneNumber}: ${otp}`);
      return {
        success: true,
        message: "OTP sent via SMS",
        isDevelopment: true,
      };
    } catch (error) {
      console.error("Error sending OTP SMS:", error);
      throw new Error(`Failed to send SMS OTP: ${error.message}`);
    }
  },

  // Send via Twilio
  async sendSMSViaTwilio(phoneNumber, otp) {
    try {
      const twilio = require("twilio");
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      const message = await client.messages.create({
        body: `Your Teaching Pariksha OTP is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      return {
        success: true,
        message: "OTP sent via SMS",
        messageSid: message.sid,
      };
    } catch (error) {
      console.error("Twilio error:", error);
      throw error;
    }
  },

  // Send via AWS SNS
  async sendSMSViaSNS(phoneNumber, otp) {
    try {
      const AWS = require("aws-sdk");
      const sns = new AWS.SNS({
        region: process.env.AWS_REGION || "us-east-1",
      });

      const params = {
        Message: `Your Teaching Pariksha OTP is: ${otp}. Valid for 10 minutes.`,
        PhoneNumber: phoneNumber,
      };

      const result = await sns.publish(params).promise();

      return {
        success: true,
        message: "OTP sent via SMS",
        messageId: result.MessageId,
      };
    } catch (error) {
      console.error("AWS SNS error:", error);
      throw error;
    }
  },

  // HTML Email Template for OTP
  getOTPEmailTemplate(otp, phoneNumber = null) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              text-align: center;
            }
            .otp-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 5px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .info {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              font-size: 14px;
              color: #666;
            }
            .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              color: #999;
              font-size: 12px;
              border-top: 1px solid #eee;
            }
            .warning {
              color: #d9534f;
              font-size: 12px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Teaching Pariksha</h1>
              <p>Verification Code</p>
            </div>
            <div class="content">
              <h2>Verify Your Account</h2>
              <p>Your one-time password (OTP) for verification is:</p>
              <div class="otp-box">${otp}</div>
              <div class="info">
                <p><strong>This code will expire in 10 minutes</strong></p>
                ${
                  phoneNumber
                    ? `<p><strong>Phone:</strong> ${phoneNumber}</p>`
                    : ""
                }
                <p class="warning">⚠️ Do not share this code with anyone. We will never ask for it.</p>
              </div>
              <p>If you didn't request this code, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Teaching Pariksha. All rights reserved.</p>
              <p>
                <a href="https://teachingpariksha.com/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
                <a href="https://teachingpariksha.com/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  },
};
