module.exports = ({ gateways: { evidenceStore } }) => {
  return async ({ dropboxId, metadata }) => {
    const uploadOptions = await evidenceStore.createUploadUrl({
      dropboxId,
      metadata
    });
    return {
      documentId: uploadOptions.documentId,
      url: uploadOptions.url,
      fields: uploadOptions.fields
    };
  };
};
