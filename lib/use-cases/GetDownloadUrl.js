module.exports = options => {
  const s3Gateway = options.gateways.s3Gateway;

  return async (dropboxId, fileId, fileName) => {
    return await s3Gateway.getDownloadUrl(dropboxId, fileId, fileName);
  };
};
