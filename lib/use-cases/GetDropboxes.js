module.exports = options => {
  const dbGateway = options.gateways.dbGateway;

  return async options => {
    let dropboxes = await dbGateway.getDropboxes();
    if (options.submitted) {
      dropboxes = dropboxes
        .filter(box => box.submitted)
        .sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
    } else {
      dropboxes = dropboxes.sort((a, b) => a.created > b.created);
    }
    return dropboxes.map(d => {
      d.count = Object.keys(d.uploads).length;
      return d;
    });
  };
};
