module.exports = ({ gateways: { evidenceStore } }) => {
  return async dropboxId => {
    const documents = await evidenceStore.getByDropboxId(dropboxId);
    const unusedDocuments = documents.filter(d => !d.filename);

    if (unusedDocuments.length > 0) {
      const { documentId, url, fields } = await evidenceStore.getUploadUrl(
        unusedDocuments[0].id
      );
      return { documentId, url, fields };
    } else {
      const { documentId, url, fields } = await evidenceStore.createUploadUrl(
        dropboxId
      );
      return { documentId, url, fields };
    }
  };
};
