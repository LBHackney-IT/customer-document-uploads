const { generateRandomString } = require('../utils');

module.exports = options => {
  const dbGateway = options.gateways.dbGateway;
  const saveFile = options.useCases.saveFile;

  return async (dropboxId, fields, upload) => {
    const data = {
      customerName: fields.customerName,
      description: fields.description,
      uploads: {}
    };
    if (upload) {
      const fileId = generateRandomString(10);
      data.uploads[fileId] = {
        fileName: upload.name,
        fileType: upload.type
      };
      if (fields.newUploadTitle !== '')
        data.uploads[fileId].title = fields.newUploadTitle;
      await saveFile(dropboxId, fileId, upload);
    }
    dbGateway.updateDropbox(dropboxId, data);
  };
};
