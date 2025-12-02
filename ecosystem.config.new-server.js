module.exports = {
  apps: [
    {
      name: '5lb-backend',
      cwd: './backend',
      // TypeScript build emits under dist/backend/src due to rootDir spanning repo
      script: 'dist/backend/src/index.js',
      interpreter: 'node',
      // Load the existing env file used by dotenv in code
      env_file: './backend/.env',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      max_memory_restart: '4096M',
      env: {
        NODE_ENV: 'production',
        PORT: 60000,  // Новый порт для backend
        APP_DOMAIN: 'https://app.5lb.pro',
        API_PUBLIC_URL: 'https://app.5lb.pro/api'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 60000,  // Новый порт для backend
        APP_DOMAIN: 'https://app.5lb.pro',
        API_PUBLIC_URL: 'https://app.5lb.pro/api'
      }
    },
    {
      name: '5lb-crm-backend',
      cwd: './crm/crm_backend',
      script: 'dist/src/index.js',
      interpreter: 'node',
      env_file: './crm/crm_backend/.env',
      instances: 1,
      autorestart: true,
      max_restarts: 5,
      max_memory_restart: '2048M',
      env: {
        NODE_ENV: 'production',
        PORT: 60001  // Новый порт для CRM
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 60001  // Новый порт для CRM
      }
    }
  ]
};
