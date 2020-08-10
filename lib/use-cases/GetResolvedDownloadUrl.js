module.exports = ({ gateways: { evidenceStore } }) => {
  return async downloadUrl => {
    return await evidenceStore.resolveDownloadUrl(downloadUrl);
  };
};
