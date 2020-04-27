const { nanoid } = require('nanoid');

module.exports = ({ gateways: { document: documents } }) => {
  return async dropboxId => {
    return documents.createUploadUrl(dropboxId, nanoid(15));
  };
};
