/**
 * SMS service using Twilio.
 * All functions gracefully no-op when Twilio env vars are not configured.
 */

function isSMSConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  );
}

let _client = null;
function getTwilioClient() {
  if (!_client) {
    const twilio = require('twilio');
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

/**
 * Send a proposal submission acknowledgement SMS.
 * @param {string} phone          - E.164 format, e.g. +919876543210
 * @param {string} name           - User's name
 * @param {string} proposalTitle  - Title of the submitted proposal
 */
async function sendProposalAcknowledgementSMS(phone, name, proposalTitle) {
  if (!isSMSConfigured()) {
    console.warn('[SMS] Twilio not configured — skipping proposal SMS.');
    return;
  }
  if (!phone) {
    console.warn('[SMS] No phone number on user — skipping proposal SMS.');
    return;
  }

  // Twilio requires strict E.164 format. Strip all spaces and non-digits first.
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = `+91${formattedPhone}`;
  } else if (formattedPhone.startsWith('0') && formattedPhone.length === 11) {
    formattedPhone = `+91${formattedPhone.slice(1)}`;
  } else if (formattedPhone.length > 10) {
    formattedPhone = `+${formattedPhone}`;
  } else {
    console.warn(`[SMS] Invalid phone number format: ${phone} — skipping.`);
    return;
  }

  const firstName = name.split(' ')[0];
  const shortTitle = proposalTitle.length > 60
    ? proposalTitle.slice(0, 57) + '...'
    : proposalTitle;

  const body =
    `Namaste ${firstName}! Your proposal "${shortTitle}" has been submitted to Jan-Mat. ` +
    `It is now open for citizen voting. Track it at janmat.in — Team Jan-Mat`;

  try {
    await getTwilioClient().messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to: formattedPhone,
    });
    console.log(`[SMS] Proposal acknowledgement sent to ${formattedPhone}`);
  } catch (err) {
    // Non-fatal — don't crash the proposal submission
    console.error('[SMS] Failed to send SMS:', err.message);
  }
}

module.exports = { sendProposalAcknowledgementSMS, isSMSConfigured };
