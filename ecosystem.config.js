module.exports = {
  apps : [{
    name: 'slack-chat',
    script: 'server.js',
    env: {
      NODE_ENV: 'production'
    },    
  }],
};
