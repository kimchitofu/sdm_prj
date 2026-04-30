import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendAccountFreezeEmail(params: {
  to: string
  firstName: string
  reason: string
}) {
  const { to, firstName, reason } = params

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'FundBridge <noreply@fundbridge.com>',
    to,
    subject: 'Your FundBridge Account Has Been Frozen',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
        <div style="background: #ef4444; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Account Frozen</h1>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="margin-top: 0;">Dear <strong>${firstName}</strong>,</p>
          <p>Your <strong>FundBridge</strong> account has been temporarily frozen by an administrator pending investigation.</p>

          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 6px; font-weight: 600; color: #b91c1c;">Reason for Freeze:</p>
            <p style="margin: 0; color: #374151;">${reason}</p>
          </div>

          <h3 style="color: #1a1a1a;">How to Appeal</h3>
          <p>If you believe this action was taken in error, you can submit an appeal by:</p>
          <ol style="color: #374151; line-height: 1.8;">
            <li>Replying directly to this email with your explanation.</li>
            <li>Emailing our support team at <a href="mailto:support@fundbridge.com" style="color: #2563eb;">support@fundbridge.com</a>.</li>
            <li>Including any evidence or context that supports your case.</li>
          </ol>
          <p>Our team will review your appeal within <strong>3–5 business days</strong> and respond via email.</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 13px; margin: 0;">
            This is an automated notification from FundBridge. Please do not reply unless you are appealing.
          </p>
        </div>
      </div>
    `,
  })
}
