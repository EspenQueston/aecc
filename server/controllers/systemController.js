const { getDatabaseStatus } = require('../utils/database-status');
const SiteSetting = require('../models/SiteSetting');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get public community stats (no auth required)
exports.getPublicStats = async (req, res) => {
  try {
    const [userCount, eventCount, universityCount] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      User.distinct('university').then(list => list.filter(Boolean).length)
    ]);
    res.json({ success: true, users: userCount, events: eventCount, universities: universityCount });
  } catch (error) {
    console.error('Public stats failed:', error);
    res.status(500).json({ success: false });
  }
};

// @desc    Check database health and system status (authenticated)
exports.healthCheck = async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();

    res.json({
      success: true,
      system: {
        status: 'operational',
        timestamp: new Date().toISOString()
      },
      database: { status: dbStatus.status, connected: dbStatus.connected }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      system: { status: 'error', timestamp: new Date().toISOString() },
      database: { status: 'unhealthy', connected: false }
    });
  }
};

// @desc    Get detailed system statistics (admin only)
exports.getStats = async (req, res) => {
  try {
    const dbStatus = await getDatabaseStatus();

    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      system: systemInfo,
      database: dbStatus
    });
  } catch (error) {
    console.error('Stats check failed:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString()
    });
  }
};

// @desc    Get current team data from database settings (public)
exports.getTeam = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: 'team_members' });
    res.json({
      success: true,
      data: setting?.value || null
    });
  } catch (error) {
    console.error('Get team failed:', error);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};

// @desc    Upsert team data in database settings (admin only)
exports.upsertTeam = async (req, res) => {
  try {
    const { value } = req.body;
    if (!value || typeof value !== 'object') {
      return res.status(400).json({ success: false, msg: 'A valid team payload is required' });
    }

    const teamSetting = await SiteSetting.findOneAndUpdate(
      { key: 'team_members' },
      { key: 'team_members', value },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: teamSetting });
  } catch (error) {
    console.error('Upsert team failed:', error);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
};
