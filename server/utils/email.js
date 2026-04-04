const nodemailer = require('nodemailer');
const { emailHost, emailPort, emailUser, emailPass, emailFrom } = require('../config/keys');

let transporter = null;

function getTransporter() {
  if (!transporter && emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }
  return transporter;
}

/**
 * Wraps email body content with AECC branded header (logo) and footer.
 * @param {string} bodyHtml - The inner HTML content of the email
 * @param {string} [siteUrl] - Base URL for logo image
 * @returns {string} Full HTML email with logo header and footer
 */
function wrapEmailTemplate(bodyHtml, siteUrl = 'https://scholarquest.shop') {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="background:linear-gradient(135deg,#B7222D,#d4303d);padding:1.5rem;text-align:center">
        <img src="${siteUrl}/logo.png" alt="AECC" style="width:48px;height:48px;border-radius:8px;object-fit:contain;margin-bottom:.5rem" />
        <h1 style="color:#fff;margin:0;font-size:1.3rem;letter-spacing:.5px">AECC</h1>
        <p style="color:rgba(255,255,255,.8);margin:.3rem 0 0;font-size:.78rem">Association des Étudiants Congolais en Chine</p>
      </div>
      <div style="padding:1.5rem 2rem">
        ${bodyHtml}
      </div>
      <div style="padding:1rem 1.5rem;background:#f8f9fa;border-top:1px solid #eee;text-align:center">
        <p style="margin:0;color:#888;font-size:.78rem">Association des Étudiants Congolais en Chine (AECC)</p>
        <p style="margin:.3rem 0 0;color:#aaa;font-size:.72rem">Unité – Travail – Réussite</p>
      </div>
    </div>
  `;
}

async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured — EMAIL_USER and EMAIL_PASS env vars required');
    return false;
  }
  try {
    await t.sendMail({
      from: emailFrom,
      replyTo: emailUser || emailFrom,
      to,
      subject,
      html,
      text
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err.message);
    return false;
  }
}

module.exports = { sendEmail, wrapEmailTemplate };
