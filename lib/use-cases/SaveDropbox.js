const { generateRandomString } = require('../utils');

module.exports = options => {
  const dbGateway = options.gateways.dbGateway;
  const saveFile = options.useCases.saveFile;

  return async (dropboxId, fields) => {
    const data = { uploads: {} };

    if (fields.customerName && fields.customerName !== '') {
      data.customerName = fields.customerName;
      data.submitted = new Date().toISOString();
    }
    if (fields.description && fields.description !== '')
      data.description = fields.description;
    if (fields.customerEmail && fields.customerEmail !== '')
      data.customerEmail = fields.customerEmail;
    if (fields.customerPhone && fields.customerPhone !== '')
      data.customerPhone = fields.customerPhone;

    if (fields.newUploadFile) {
      const fileId = generateRandomString(10);
      data.uploads[fileId] = {
        fileName: fields.newUploadFile.filename,
        fileType: fields.newUploadFile.contentType
      };
      if (fields.newUploadTitle !== '')
        data.uploads[fileId].title = fields.newUploadTitle;
      await saveFile(
        dropboxId,
        fileId,
        fields.newUploadFile.filename,
        Buffer.from(fields.newUploadFile.content, 'binary')
      );
    }
    await dbGateway.updateDropbox(dropboxId, data);
  };
};
