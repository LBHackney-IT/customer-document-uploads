module.exports = ({ gateways: { dropbox: dropboxes } }) => {
  return async options => {
    const allDropboxes = await dropboxes.list();

    if (options.submitted) {
      return allDropboxes
        .filter(box => box.isSubmitted)
        .sort((a, b) => new Date(b.submitted) - new Date(a.submitted));
    } else {
      return allDropboxes.sort(
        (a, b) => new Date(a.created) > new Date(b.created)
      );
    }
  };
};
