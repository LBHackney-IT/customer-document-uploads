module.exports = ({
  gateways: { dropbox: dropboxes, notify: notifyGateway, evidenceStore }
}) => {
  return async ({ dropboxId }) => {
    try {
      const [dropbox, documents] = await Promise.all([
        dropboxes.get(dropboxId),
        evidenceStore.getByDropboxId(dropboxId)
      ]);

      if (!dropbox) {
        throw new Error('Invalid dropbox');
      }

      if (documents[0].requestedBy) {
        return await notifyGateway.send(dropbox, documents[0].requestedBy);
      }
    } catch (err) {
      console.log('Could not send email notification:' + err);
    }
  };
};
