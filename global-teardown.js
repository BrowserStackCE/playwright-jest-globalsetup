const fs = require('fs');
const path = require('path');

const SESSION_PATH = path.resolve(process.cwd(), 'session.json');
const STORAGE_STATE_PATH = path.resolve(process.cwd(), 'storageState.json');
const SESSION_STORAGE_PATH = path.resolve(process.cwd(), 'sessionStorage.json');

/**
 * Runs once after the Jest suite.
 * Removes auth artifacts so the next run always starts from a fresh login.
 */
module.exports = async () => {
  for (const file of [SESSION_PATH, STORAGE_STATE_PATH, SESSION_STORAGE_PATH]) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
};
