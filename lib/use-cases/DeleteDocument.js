module.exports = ({ gateways: { document: documents } }) => {
  return async (dropboxId, documentId) => {
    await documents.deleteFromDropbox(dropboxId, documentId);
  };
};
