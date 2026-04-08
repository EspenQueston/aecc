module.exports = {
  apps: [
    {
      name: 'aecc',
      script: 'server/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Restart if memory exceeds 300MB per worker
      max_memory_restart: '300M',
      // Graceful restart
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Logs
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      // Watch disabled in production
      watch: false
    },
    {
      name: 'aecc-staging',
      script: 'server/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'staging',
        PORT: 5001
      },
      max_memory_restart: '200M',
      error_file: './logs/staging-err.log',
      out_file: './logs/staging-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      watch: false
    }
  ]
};
