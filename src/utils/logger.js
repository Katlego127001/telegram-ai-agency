const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const getTimestamp = () => new Date().toISOString();

const logger = {
  info: (message, data = {}) => {
    const log = `[${getTimestamp()}] INFO: ${message}`;
    console.log(`\x1b[36m${log}\x1b[0m`, data);
    fs.appendFileSync(
      path.join(logsDir, 'app.log'),
      `${log} ${JSON.stringify(data)}\n`
    );
  },

  error: (message, error = {}) => {
    const log = `[${getTimestamp()}] ERROR: ${message}`;
    console.error(`\x1b[31m${log}\x1b[0m`, error);
    fs.appendFileSync(
      path.join(logsDir, 'error.log'),
      `${log} ${JSON.stringify(error)}\n`
    );
  },

  warn: (message, data = {}) => {
    const log = `[${getTimestamp()}] WARN: ${message}`;
    console.warn(`\x1b[33m${log}\x1b[0m`, data);
    fs.appendFileSync(
      path.join(logsDir, 'app.log'),
      `${log} ${JSON.stringify(data)}\n`
    );
  },

  debug: (message, data = {}) => {
    const log = `[${getTimestamp()}] DEBUG: ${message}`;
    console.log(`\x1b[35m${log}\x1b[0m`, data);
  }
};

module.exports = logger;