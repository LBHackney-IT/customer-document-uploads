const { nanoid } = require('nanoid');

module.exports = ({ gateways: { document: documents } }) => {
  return async dropboxId => {
    const documentId = nanoid(15);

    const uploadOptions = await documents.createUploadUrl(
      dropboxId,
      documentId
    );

    return { documentId, ...uploadOptions };
  };
};
