module.exports = {
  apps: [
    {
      name: 'orbe-api',
      script: './dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
      },
    },
  ],
};