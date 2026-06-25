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

function wrapHtml(body: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f4f6f8; padding: 24px;">
      <div style="background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 600;">Coder71 Support</h1>
        </div>
        <div style="padding: 32px;">
          ${body}
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">${fromName} &middot; Support Portal</p>
          <p style="margin: 4px 0 0; color: #d1d5db; font-size: 11px;">This is an automated message. Please do not reply directly.</p>
        </div>
      </div>
    </div>
  `;
}

function button(link: string, label: string): string {
  return `<a href="${link}" style="display: inline-block; padding: 12px 28px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0;">${label}</a>`;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'Reset your password',
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Reset your password</h2>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">You requested a password reset. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
      <div style="text-align: center;">${button(resetLink, 'Reset Password')}</div>
      <p style="color: #9ca3af; font-size: 13px; margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #e5e7eb;">If you didn't request this, you can safely ignore this email.</p>
    `),
  });
}

export async function sendTicketCreatedEmail(to: string, toName: string, ticketNumber: string, subject: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] New ticket: ${subject}`,
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">New ticket created</h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">Hi <strong>${toName}</strong>, a new support ticket has been created.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px; background: #f9fafb; border-radius: 8px;">
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Ticket</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${ticketNumber}</td></tr>
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px;">Subject</td><td style="padding: 10px 16px; font-size: 13px;">${subject}</td></tr>
      </table>
      <div style="text-align: center;">${button(link, 'View Ticket')}</div>
    `),
  });
}

export async function sendTicketAssignedEmail(to: string, toName: string, ticketNumber: string, subject: string, assignedBy: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] Ticket assigned to you`,
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Ticket assigned to you</h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">Hi <strong>${toName}</strong>, ticket <strong>${ticketNumber}</strong> has been assigned to you by ${assignedBy}.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px; background: #f9fafb; border-radius: 8px;">
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">Ticket</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">${ticketNumber}</td></tr>
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px;">Subject</td><td style="padding: 10px 16px; font-size: 13px;">${subject}</td></tr>
      </table>
      <div style="text-align: center;">${button(link, 'View Ticket')}</div>
    `),
  });
}

export async function sendTicketStatusEmail(to: string, toName: string, ticketNumber: string, oldStatus: string, newStatus: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] Status changed to ${newStatus.replace(/_/g, ' ')}`,
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Status updated</h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px;">Hi <strong>${toName}</strong>, the status of <strong>${ticketNumber}</strong> has changed.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 0 0 20px; background: #f9fafb; border-radius: 8px;">
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">From</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600; text-transform: capitalize; border-bottom: 1px solid #e5e7eb;">${oldStatus.replace(/_/g, ' ')}</td></tr>
        <tr><td style="padding: 10px 16px; color: #6b7280; font-size: 13px;">To</td><td style="padding: 10px 16px; font-size: 13px; font-weight: 600; text-transform: capitalize;">${newStatus.replace(/_/g, ' ')}</td></tr>
      </table>
      <div style="text-align: center;">${button(link, 'View Ticket')}</div>
    `),
  });
}

export async function sendCredentialsEmail(to: string, toName: string, tempPassword: string, loginLink: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: 'Your account has been created',
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">Welcome, ${toName}!</h2>
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">An account has been created for you on the support portal. Use the credentials below to sign in.</p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
        <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
        <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #111827;">${to}</p>
        <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
        <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827; font-family: 'Courier New', monospace; letter-spacing: 1px;">${tempPassword}</p>
      </div>
      <div style="text-align: center;">${button(loginLink, 'Sign In')}</div>
      <p style="color: #dc2626; font-size: 13px; font-weight: 500; text-align: center; margin: 16px 0 0;">You will be required to change your password after first login.</p>
    `),
  });
}

export async function sendTicketMessageEmail(to: string, toName: string, ticketNumber: string, senderName: string, preview: string, link: string): Promise<void> {
  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to,
    subject: `[${ticketNumber}] New message from ${senderName}`,
    html: wrapHtml(`
      <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px;">New message</h2>
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">Hi <strong>${toName}</strong>, <strong>${senderName}</strong> sent a message on <strong>${ticketNumber}</strong>.</p>
      <blockquote style="border-left: 3px solid #2563eb; padding: 12px 16px; margin: 0 0 20px; background: #f9fafb; color: #374151; border-radius: 6px; font-size: 14px; line-height: 1.5;">${preview}</blockquote>
      <div style="text-align: center;">${button(link, 'View Message')}</div>
    `),
  });
}