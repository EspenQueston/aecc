const { getDatabaseStatus } = require('../utils/database-status');

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
