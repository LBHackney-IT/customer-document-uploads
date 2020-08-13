module.exports = ({ gateways: { evidenceStore } }) => {
  return async ({ dropboxId, metadata }) => {
    const documents = await evidenceStore.getByDropboxId(dropboxId);
    const unusedDocuments = documents.filter(d => !d.filename);

    return unusedDocuments.length > 0
      ? await evidenceStore.getUploadUrl(unusedDocuments[0].id)
      : await evidenceStore.createUploadUrl({ dropboxId, metadata });
  };
};
