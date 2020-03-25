module.exports = options => {
  const dbGateway = options.gateways.dbGateway;

  return async (dropboxId, fields, upload) => {
    dbGateway.updateDropbox(dropboxId, {
      customerName: fields.customerName,
      description: fields.description
    });
  };
};
