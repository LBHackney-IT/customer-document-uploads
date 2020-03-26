const { generateRandomString } = require('../utils');
const fs = require('fs').promises;

module.exports = options => {
  const s3Gateway = options.gateways.s3Gateway;

  return async (dropboxId, fileId, upload) => {
    const path = `${dropboxId}/${fileId}/${upload.name}`;
    const file = await fs.readFile(upload.path);
    s3Gateway.saveFile(path, file);
  };
};
