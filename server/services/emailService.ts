import nodemailer from "nodemailer"

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTPEmail(
  toEmail: string,

  otp: string,

  type: "signup" | "forgot_password",
) {
  const smtpEmail = process.env.SMTP_EMAIL || process.env.SMTP_USER

  const smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS

  console.log("--------------------------------------------------")

  console.log(`🔑 [STUDYSTACK OTP CODE] (${type})`)

  console.log(`Recipient: ${toEmail}`)

  console.log(`OTP Code:  >>> ${otp} <<<`)

  console.log("--------------------------------------------------")

  if (!smtpEmail || !smtpPass) {
    console.log(
      "ℹ️ Note: SMTP_EMAIL / SMTP_PASSWORD not yet set in .env. Using console OTP for local testing.",
    )

    return true
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: smtpEmail,

        pass: smtpPass,
      },
    })

    const isSignup = type === "signup"

    const subject = isSignup
      ? "StudyStack — Verify Your IITR Email"
      : "StudyStack — Reset Your Password"

    const title = isSignup ? "Verify Your Account" : "Password Reset Request"

    const desc = isSignup
      ? "Welcome to StudyStack, the academic resource-sharing platform for IIT Roorkee students. Enter the OTP code below to verify your email:"
      : "You requested to reset your StudyStack password. Use the verification code below to complete the reset:"

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #F5F8FC; padding: 40px 20px; color: #0F172A;">
        <div style="max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E2E8F0;">
          <div style="background-color: #061B49; padding: 24px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: 0.5px;">StudyStack</h1>
            <p style="color: #55C7FF; margin: 4px 0 0 0; font-size: 13px;">Your Stack. Your Track.</p>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #0F172A; font-size: 20px; margin-top: 0;">${title}</h2>
            <p style="color: #64748B; font-size: 14px; line-height: 1.6;">${desc}</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background-color: #F5F8FC; border: 2px dashed #146EF5; color: #146EF5; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 28px; border-radius: 8px;">
                ${otp}
              </span>
            </div>
            <p style="color: #64748B; font-size: 12px; text-align: center; margin-bottom: 0;">
              This code will expire in 10 minutes. If you did not make this request, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"StudyStack IITR" <${smtpEmail}>`,

      to: toEmail,

      subject,

      html,
    })

    console.log(`✅ Email sent successfully to ${toEmail}`)

    return true
  } catch (error) {
    console.error(
      "⚠️ Failed to send email via SMTP, but OTP is logged in console above:",

      error,
    )

    return true // Still allow testing via console log
  }
}
