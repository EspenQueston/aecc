const TelegramChannel = require('../models/TelegramChannel');
const LearningResource = require('../models/LearningResource');
const path = require('path');
const fs = require('fs');

const CATEGORIES = [
  { value: 'finances-economie', label: 'Finances & Économie', icon: 'fas fa-chart-line' },
  { value: 'computer-science', label: 'Computer Science', icon: 'fas fa-laptop-code' },
  { value: 'droit-law', label: 'Droit & Law', icon: 'fas fa-gavel' },
  { value: 'business-commerce', label: 'Business & Commerce', icon: 'fas fa-briefcase' },
  { value: 'agriculture-elevage', label: 'Agriculture & Élevage', icon: 'fas fa-seedling' },
  { value: 'marketing-communication', label: 'Marketing & Communication', icon: 'fas fa-bullhorn' },
  { value: 'cryptomonnaie', label: 'Cryptomonnaie', icon: 'fab fa-bitcoin' },
  { value: 'sciences-physique', label: 'Sciences — Physique', icon: 'fas fa-atom' },
  { value: 'sciences-chimie', label: 'Sciences — Chimie', icon: 'fas fa-flask' },
  { value: 'sciences-biologie', label: 'Sciences — Biologie', icon: 'fas fa-dna' },
  { value: 'sciences-mathematiques', label: 'Sciences — Mathématiques', icon: 'fas fa-square-root-alt' },
  { value: 'sciences-medecine', label: 'Sciences — Médecine', icon: 'fas fa-stethoscope' },
  { value: 'sciences-ingenierie', label: 'Sciences — Ingénierie', icon: 'fas fa-cogs' },
  { value: 'langues', label: 'Langues', icon: 'fas fa-language' },
  { value: 'art-culture', label: 'Art & Culture', icon: 'fas fa-palette' },
  { value: 'developpement-personnel', label: 'Développement Personnel', icon: 'fas fa-brain' },
  { value: 'aecc', label: 'AECC', icon: 'fas fa-users' },
  { value: 'autre', label: 'Autre', icon: 'fas fa-ellipsis-h' }
];

const LEVELS = [
  { value: '', label: 'Non spécifié' },
  { value: 'tous-niveaux', label: 'Tous niveaux' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' }
];

// GET /api/learning/channels — public, with search and category filter
exports.getChannels = async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const channels = await TelegramChannel.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, data: channels, categories: CATEGORIES });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// GET /api/learning/categories — return categories list
exports.getCategories = (req, res) => {
  res.json({ success: true, data: CATEGORIES });
};

// ── Admin routes ──

// GET /api/learning/admin — paginated list for admin
exports.getChannelsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    const [channels, total] = await Promise.all([
      TelegramChannel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      TelegramChannel.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: channels,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// POST /api/learning — create channel
exports.createChannel = async (req, res) => {
  try {
    const { name, description, url, category, icon, subscribers, language, featured, status } = req.body;
    if (!name || !description || !url || !category) {
      return res.status(400).json({ msg: 'Nom, description, URL et catégorie sont requis' });
    }
    const channel = new TelegramChannel({ name, description, url, category, icon, subscribers, language, featured, status });
    await channel.save();
    res.status(201).json({ success: true, data: channel });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// PUT /api/learning/:id — update channel
exports.updateChannel = async (req, res) => {
  try {
    const channel = await TelegramChannel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!channel) return res.status(404).json({ msg: 'Canal non trouvé' });
    res.json({ success: true, data: channel });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// DELETE /api/learning/:id — delete channel
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await TelegramChannel.findByIdAndDelete(req.params.id);
    if (!channel) return res.status(404).json({ msg: 'Canal non trouvé' });
    res.json({ success: true, msg: 'Canal supprimé' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// ── Learning Resources (formations, youtube, links) ──

// GET /api/learning/resources/public?type=formation — public
exports.getResources = async (req, res) => {
  try {
    const filter = { status: 'active' };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    const resources = await LearningResource.find(filter).sort({ order: 1, featured: -1, createdAt: -1 });
    res.json({ success: true, data: resources });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// GET /api/learning/resources/:id — single resource detail (public)
exports.getResourceById = async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ msg: 'Ressource non trouvée' });
    res.json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Ressource non trouvée' });
    res.status(500).json({ msg: 'Server Error' });
  }
};

// GET /api/learning/resources/admin — paginated list for admin
exports.getResourcesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }
    const [resources, total] = await Promise.all([
      LearningResource.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit),
      LearningResource.countDocuments(filter)
    ]);
    res.json({
      success: true,
      data: resources,
      pagination: { total, page, pages: Math.ceil(total / limit) },
      levels: LEVELS
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// POST /api/learning/resources — create resource (supports file upload)
exports.createResource = async (req, res) => {
  try {
    const { type, title, description, url, icon, color, level, slug, highlight, featured, status, order,
            longDescription, advantages, disadvantages, details } = req.body;
    if (!type || !title || !description) {
      return res.status(400).json({ msg: 'Type, titre et description sont requis' });
    }
    const resourceData = { type, title, description, icon, color, level, slug, highlight, featured, status, order,
                           longDescription };
    // Parse JSON arrays from FormData
    if (advantages) resourceData.advantages = typeof advantages === 'string' ? JSON.parse(advantages) : advantages;
    if (disadvantages) resourceData.disadvantages = typeof disadvantages === 'string' ? JSON.parse(disadvantages) : disadvantages;
    if (details) resourceData.details = typeof details === 'string' ? JSON.parse(details) : details;
    // File or URL
    if (req.file) {
      resourceData.filePath = `/uploads/${req.file.filename}`;
      resourceData.fileName = req.file.originalname;
    }
    if (url) resourceData.url = url;
    if (!url && !req.file) {
      return res.status(400).json({ msg: 'Un URL ou un fichier est requis' });
    }
    const resource = new LearningResource(resourceData);
    await resource.save();
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// PUT /api/learning/resources/:id — update resource (supports file upload)
exports.updateResource = async (req, res) => {
  try {
    const existing = await LearningResource.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'Ressource non trouvée' });

    const updates = { ...req.body };
    // Parse JSON arrays from FormData
    if (updates.advantages) updates.advantages = typeof updates.advantages === 'string' ? JSON.parse(updates.advantages) : updates.advantages;
    if (updates.disadvantages) updates.disadvantages = typeof updates.disadvantages === 'string' ? JSON.parse(updates.disadvantages) : updates.disadvantages;
    if (updates.details) updates.details = typeof updates.details === 'string' ? JSON.parse(updates.details) : updates.details;
    // Handle file upload on update
    if (req.file) {
      // Delete old file if exists
      if (existing.filePath) {
        const oldPath = path.join(__dirname, '..', existing.filePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.filePath = `/uploads/${req.file.filename}`;
      updates.fileName = req.file.originalname;
    }
    // If URL is provided and no new file, clear file fields
    if (updates.url && !req.file && !updates.keepFile) {
      if (existing.filePath) {
        const oldPath = path.join(__dirname, '..', existing.filePath);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.filePath = '';
      updates.fileName = '';
    }

    const resource = await LearningResource.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: resource });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// DELETE /api/learning/resources/:id — delete resource
exports.deleteResource = async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ msg: 'Ressource non trouvée' });
    // Delete associated file
    if (resource.filePath) {
      const filePath = path.join(__dirname, '..', resource.filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ success: true, msg: 'Ressource supprimée' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};
