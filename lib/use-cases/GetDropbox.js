module.exports = ({ gateways: { dropbox: dropboxes, evidenceStore } }) => {
  return async dropboxId => {
    const [dropbox, uploads] = await Promise.all([
      dropboxes.get(dropboxId),
      evidenceStore.getByDropboxId(dropboxId)
    ]);

    if (!dropbox) {
      return null;
    }

    return {
      ...dropbox,
      uploads,
      hasUploads: uploads.length > 0
    };
  };
};
