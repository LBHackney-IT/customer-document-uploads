const { Dropbox } = require('../domain/dropbox');

module.exports = ({ gateways: { dropbox: dropboxes } }) => {
  return async () => {
    const dropbox = Dropbox.empty();
    return await dropboxes.save(dropbox);
  };
};
