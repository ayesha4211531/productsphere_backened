const db = require("../config/db");

// Get all system settings as a key-value map
const getSettings = async () => {
  const [rows] = await db.query("SELECT `key`, `value` FROM system_settings");
  const settings = {};
  rows.forEach((row) => {
    settings[row.key] = row.value;
  });
  return settings;
};

// Upsert a single setting
const upsertSetting = async (key, value) => {
  await db.query(
    `INSERT INTO system_settings (\`key\`, \`value\`) VALUES (?, ?)
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
    [key, String(value)]
  );
};

// Upsert multiple settings from an object
const upsertSettings = async (settingsObj) => {
  const entries = Object.entries(settingsObj);
  for (const [key, value] of entries) {
    await upsertSetting(key, value);
  }
};

module.exports = { getSettings, upsertSetting, upsertSettings };