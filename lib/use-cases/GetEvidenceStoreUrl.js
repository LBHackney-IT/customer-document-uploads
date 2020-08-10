module.exports = ({ gateways: { evidenceStore } }) => {
  return async dropboxId => {
    const uploadOptions = await evidenceStore.createUploadUrl(dropboxId);
    return {
      documentId: uploadOptions.documentId,
      url: uploadOptions.url,
      fields: uploadOptions.fields
    };
  };
};
