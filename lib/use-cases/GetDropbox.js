module.exports = options => {
  const dbGateway = options.gateways.dbGateway;

  return async dropboxId => {
    const dropbox = await dbGateway.getDropbox(dropboxId);
    if (dropbox) {
      dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
    }
    return dropbox;
  };
};
