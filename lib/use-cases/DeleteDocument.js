module.exports = ({ gateways: { evidenceStore } }) => {
  return async documentId => {
    await evidenceStore.deleteByDocumentId(documentId);
  };
};
