const { Dropbox } = require('../domain/dropbox');

module.exports = ({ gateways: { dropbox: dropboxes } }) => {
  return async requestId => {
    const dropbox = Dropbox.empty();
    if (requestId) dropbox.requestId = requestId;
    return await dropboxes.save(dropbox);
  };
};
