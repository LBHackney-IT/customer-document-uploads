module.exports = options => {
  const s3Gateway = options.gateways.s3Gateway;

  return async (dropboxId, fileId, name, file) => {
    const path = `${dropboxId}/${fileId}/${name}`;
    s3Gateway.saveFile(path, file);
  };
};
