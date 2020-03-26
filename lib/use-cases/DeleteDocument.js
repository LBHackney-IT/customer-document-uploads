module.exports = options => {
  const dbGateway = options.gateways.dbGateway;
  const s3Gateway = options.gateways.s3Gateway;

  return async (dropboxId, documentId) => {
    const document = await dbGateway.getDropbox(dropboxId);
    if(document.uploads[documentId]){
      await dbGateway.deleteDocument(dropboxId, documentId);
      await s3Gateway.deleteDocument(`${dropboxId}/${documentId}/${document.uploads[documentId].fileName}`);
    }
  };
};
