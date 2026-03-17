const nodemailer = require('nodemailer');

/**
 * Returns true only if SMTP credentials are set in .env
 */
function isEmailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Create a reusable transporter (lazy, created once)
 */
let _transporter = null;
function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

/**
 * Send a branded OTP verification email.
 * @param {string} to   - recipient email
 * @param {string} name - recipient name
 * @param {string} otp  - 6-digit OTP (plain text)
 */
async function sendOTPEmail(to, name, otp) {
  if (!isEmailConfigured()) {
    console.warn('[Email] SMTP not configured — skipping OTP email. OTP for dev:', otp);
    return;
  }

  const from = process.env.EMAIL_FROM || `"Jan-Mat" <${process.env.SMTP_USER}>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <style>
        body { font-family: 'Georgia', serif; background: #f5f5f0; margin: 0; padding: 0; }
        .wrapper { max-width: 520px; margin: 40px auto; background: #fff; border: 1px solid #e5e7eb; }
        .header { background: #1b263b; padding: 28px 32px; }
        .header-logo { display: flex; align-items: center; gap: 12px; }
        .logo-box { width: 36px; height: 36px; background: #c0392b; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold; }
        .logo-text { color: white; font-size: 20px; font-weight: bold; }
        .logo-sub { color: #94a3b8; font-size: 10px; font-family: sans-serif; letter-spacing: 0.15em; text-transform: uppercase; display: block; }
        .body { padding: 32px; }
        .greeting { color: #1b263b; font-size: 22px; font-weight: bold; margin-bottom: 8px; }
        .subtext { color: #6b7280; font-size: 14px; font-family: sans-serif; line-height: 1.6; margin-bottom: 28px; }
        .otp-box { background: #1b263b; padding: 20px 32px; text-align: center; margin: 0 auto 28px; width: fit-content; min-width: 180px; }
        .otp-label { color: #94a3b8; font-size: 10px; font-family: sans-serif; text-transform: uppercase; letter-spacing: 0.2em; margin-bottom: 8px; }
        .otp-code { color: #c0392b; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: monospace; }
        .expiry { color: #6b7280; font-size: 12px; font-family: sans-serif; text-align: center; margin-bottom: 28px; }
        .footer { border-top: 1px solid #e5e7eb; padding: 20px 32px; color: #9ca3af; font-size: 11px; font-family: sans-serif; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <div class="header-logo">
            <div class="logo-box">जन</div>
            <div>
              <div class="logo-text">Jan-Mat</div>
              <span class="logo-sub">People's Voice</span>
            </div>
          </div>
        </div>
        <div class="body">
          <div class="greeting">Verify your email, ${name.split(' ')[0]}</div>
          <div class="subtext">
            Welcome to Jan-Mat — India's citizen-to-Parliament platform. Use the code below to verify your email address and activate your account.
          </div>
          <div class="otp-box">
            <div class="otp-label">Your One-Time Password</div>
            <div class="otp-code">${otp}</div>
          </div>
          <div class="expiry">⏱ This code expires in <strong>10 minutes</strong>.</div>
          <div class="subtext" style="font-size:12px">If you did not create a Jan-Mat account, you can safely ignore this email.</div>
        </div>
        <div class="footer">
          Jan-Mat · Citizen Democracy Platform · India<br/>
          This is an automated message — please do not reply.
        </div>
      </div>
    </body>
    </html>
  `;

  await getTransporter().sendMail({
    from,
    to,
    subject: `${otp} is your Jan-Mat verification code`,
    html,
    text: `Your Jan-Mat OTP is: ${otp}\n\nIt expires in 10 minutes. If you did not request this, ignore this email.`,
  });

  console.log(`[Email] OTP sent to ${to}`);
}

module.exports = { sendOTPEmail, isEmailConfigured };
