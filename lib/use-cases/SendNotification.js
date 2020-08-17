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

      if (documents[0].requestedBy && documents[0].requestedByEmail) {
        return await notifyGateway.send(
          dropbox,
          documents[0].requestedBy,
          documents[0].requestedByEmail
        );
      }
    } catch (err) {
      console.log('Could not send email notification:' + err);
    }
  };
};
