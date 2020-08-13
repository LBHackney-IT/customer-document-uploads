module.exports = ({ gateways: { dropbox: dropboxes, evidenceStore } }) => {
  return async dropboxId => {
    const [dropbox, documents] = await Promise.all([
      dropboxes.get(dropboxId),
      evidenceStore.getByDropboxId(dropboxId)
    ]);

    if (!dropbox) {
      return null;
    }

    const uploads = documents.filter(u => u.filename);

    return {
      ...dropbox,
      uploads,
      hasUploads: uploads.length > 0
    };
  };
};
