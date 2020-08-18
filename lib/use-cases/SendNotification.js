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
        const response = await notifyGateway.send(
          dropbox,
          documents[0].requestedBy,
          documents[0].requestedByEmail
        );
        console.log(`Notification sent: ${JSON.stringify(response.body)}`);
      }
    } catch (err) {
      console.log('Could not send email notification:' + err);
    }
  };
};
