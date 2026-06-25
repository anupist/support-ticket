import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const fromAddress = process.env.SMTP_FROM_ADDRESS || 'no-reply@coder71.com';
const fromName = process.env.SMTP_FROM_NAME || 'Coder71 Support';

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${fromName}</p>
      </div>
    `,
  });
}

export async function sendTicketCreatedEmail(to: string, toName: string, ticketNumber: string, subject: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] New ticket created: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>New Ticket Created</h2>
        <p>Hi ${toName},</p>
        <p>A new support ticket has been created:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #666;">Number</td><td style="padding: 8px; font-weight: 600;">${ticketNumber}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Subject</td><td style="padding: 8px;">${subject}</td></tr>
        </table>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Ticket</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${fromName}</p>
      </div>
    `,
  });
}

export async function sendTicketStatusEmail(to: string, toName: string, ticketNumber: string, oldStatus: string, newStatus: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] Status changed to ${newStatus.replace(/_/g, ' ')}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Ticket Status Updated</h2>
        <p>Hi ${toName},</p>
        <p>The status of ticket <strong>${ticketNumber}</strong> has changed:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; color: #666;">From</td><td style="padding: 8px; font-weight: 600; text-transform: capitalize;">${oldStatus.replace(/_/g, ' ')}</td></tr>
          <tr><td style="padding: 8px; color: #666;">To</td><td style="padding: 8px; font-weight: 600; text-transform: capitalize;">${newStatus.replace(/_/g, ' ')}</td></tr>
        </table>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Ticket</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${fromName}</p>
      </div>
    `,
  });
}

export async function sendTicketMessageEmail(to: string, toName: string, ticketNumber: string, fromName: string, preview: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] New message from ${fromName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>New Message on Ticket</h2>
        <p>Hi ${toName},</p>
        <p><strong>${fromName}</strong> sent a message on <strong>${ticketNumber}</strong>:</p>
        <blockquote style="border-left: 3px solid #2563eb; padding: 12px 16px; margin: 16px 0; background: #f9fafb; color: #374151; border-radius: 4px;">${preview}</blockquote>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">View Message</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">${fromName}</p>
      </div>
    `,
  });
}