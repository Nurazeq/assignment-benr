// utils/logger.js
function logAction(action, user) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] - ${action} for user: ${user}`);
  }
  
  module.exports = logAction;