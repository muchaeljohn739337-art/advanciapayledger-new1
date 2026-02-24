module.exports = {
  apps: [{
    name: 'advancia-backend',
    cwd: './backend-clean',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    time: true,
    max_memory_restart: '500M',
    exp_backoff_restart_delay: 100,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Auto-restart on crash
    autorestart: true,
    max_restarts: 10,
    restart_delay: 1000
  }]
};
