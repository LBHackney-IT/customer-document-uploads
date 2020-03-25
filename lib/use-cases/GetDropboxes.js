module.exports = options => {
  const dbGateway = options.gateways.dbGateway;

  return async dropboxId => {
    return await dbGateway.getDropboxes(dropboxId);
  };
};
