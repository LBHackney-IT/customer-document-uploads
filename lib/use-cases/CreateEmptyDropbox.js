module.exports = options => {
  const dbGateway = options.gateways.dbGateway;

  return async dropboxId => {
    return await dbGateway.createDropbox({
      dropboxId,
      uploads: {},
      submitted: false,
      created: new Date().toISOString()
    });
  };
};
