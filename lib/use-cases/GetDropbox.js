module.exports = ({
  gateways: { dropbox: dropboxes, document: documents }
}) => {
  return async dropboxId => {
    const [dropbox, uploads] = await Promise.all([
      dropboxes.get(dropboxId),
      documents.getByDropboxId(dropboxId)
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
