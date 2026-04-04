const Contact = require('../models/Contact');
const { validationResult } = require('express-validator');
const { sendEmail, wrapEmailTemplate } = require('../utils/email');

// Prevent XSS in HTML emails
const escapeHtml = (str) => {
  if (!str) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
};

// @desc    Submit a contact form message
exports.submitContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, subject, message } = req.body;

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    // Notify admin of new contact message
    sendEmail({
      to: 'cluivermoukendi@gmail.com',
      subject: `[AECC] Nouveau message: ${subject}`,
      html: wrapEmailTemplate(`
        <h2 style="color:#1a1a1a;margin:0 0 1rem;font-size:1.2rem">Nouveau message de contact</h2>
        <p><strong>De :</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
        <div style="background:#f8f9fa;padding:1rem;border-left:4px solid #B7222D;margin:1rem 0;border-radius:4px">
          <p style="margin:0;white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
        <p style="color:#666;font-size:.85rem">Connectez-vous au panel admin pour répondre.</p>
      `),
      text: `Nouveau message de ${name} (${email})\nSujet: ${subject}\n\n${message}`
    }).catch(() => {});

    // Send acknowledgment email to the user
    sendEmail({
      to: email,
      subject: `Accusé de réception — ${subject} — AECC`,
      html: wrapEmailTemplate(`
        <p>Bonjour <strong>${escapeHtml(name)}</strong>,</p>
        <p>Nous avons bien reçu votre message concernant <em>"${escapeHtml(subject)}"</em>.</p>
        <p>Notre équipe examinera votre demande et vous répondra dans un délai de <strong>24 à 48 heures</strong>.</p>
        <div style="background:#f8f9fa;padding:1rem;border-left:4px solid #B7222D;margin:1rem 0;border-radius:4px">
          <p style="margin:0;font-size:.9rem;color:#555"><strong>Votre message :</strong></p>
          <p style="margin:.5rem 0 0;white-space:pre-wrap;color:#333">${escapeHtml(message)}</p>
        </div>
        <p style="margin-top:1.5rem">En attendant, n'hésitez pas à consulter :</p>
        <ul style="color:#555;line-height:2">
          <li>Notre page <strong>Ressources</strong> pour les guides utiles</li>
          <li>Notre page <strong>Apprentissage</strong> pour les formations</li>
          <li>Notre <strong>chatbot</strong> sur le site pour des réponses instantanées</li>
        </ul>
      `),
      text: `Bonjour ${name},\n\nNous avons bien reçu votre message concernant "${subject}".\nNotre équipe vous répondra dans un délai de 24 à 48 heures.\n\nVotre message :\n${message}\n\n—\nAECC — Association des Étudiants Congolais en Chine\nUnité – Travail – Réussite`
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get all contact messages (admin)
exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const startIndex = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      count: contacts.length,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      data: contacts
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update contact status (admin)
exports.updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }

    res.json({ success: true, data: contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Reply to a contact message (admin)
exports.replyToContact = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ msg: 'Reply message is required' });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }

    contact.replies.push({ message: message.trim(), author: 'Admin' });
    contact.status = 'replied';
    await contact.save();

    // Send email reply to the contact
    await sendEmail({
      to: contact.email,
      subject: `Re: ${contact.subject} — AECC`,
      html: wrapEmailTemplate(`
        <p>Bonjour <strong>${escapeHtml(contact.name)}</strong>,</p>
        <p>Merci pour votre message concernant "<em>${escapeHtml(contact.subject)}</em>".</p>
        <div style="background:#f8f9fa;padding:1rem;border-left:4px solid #B7222D;margin:1rem 0;border-radius:4px">
          <p style="margin:0;white-space:pre-wrap">${escapeHtml(message.trim())}</p>
        </div>
        <hr style="border:0;border-top:1px solid #eee;margin:1.5rem 0">
        <p style="color:#666;font-size:.85rem">Si vous avez d'autres questions, n'hésitez pas à répondre à ce message.</p>
      `),
      text: `Bonjour ${contact.name},\n\nMerci pour votre message concernant "${contact.subject}".\n\nRéponse:\n${message.trim()}\n\n—\nAECC - Association des Étudiants Congolais en Chine`
    });

    res.json({ success: true, data: contact });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get single contact by ID (admin)
exports.getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }
    res.json({ success: true, data: contact });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Contact message not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete contact message (admin)
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ msg: 'Contact message not found' });
    }
    res.json({ success: true, msg: 'Contact deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Contact message not found' });
    res.status(500).json({ msg: 'Server Error' });
  }
};
