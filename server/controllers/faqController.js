const FAQ = require('../models/FAQ');

// @desc    Get all active FAQs
exports.getFAQs = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const faqs = await FAQ.find(filter).sort({ category: 1, order: 1 });
    res.json({ success: true, data: faqs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create FAQ (admin)
exports.createFAQ = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update FAQ (admin)
exports.updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete FAQ (admin)
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: 'FAQ not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
