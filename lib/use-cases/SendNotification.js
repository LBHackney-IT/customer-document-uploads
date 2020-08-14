module.exports = ({
  gateways: { dropbox: dropboxes, email: emailGateway }
}) => {
  return async ({ dropboxId }) => {
    try {
      const dropbox = await dropboxes.get(dropboxId);

      if (!dropbox) {
        throw new Error('Invalid dropbox');
      }

      if (dropbox.requestedBy) {
        return await emailGateway.send(dropbox);
      }
    } catch (err) {
      console.log('Could not send email notification:' + err);
    }
  };
};
