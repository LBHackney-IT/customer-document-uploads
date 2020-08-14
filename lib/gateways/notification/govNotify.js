module.exports = ({ client, log }) => {
  function send(dropbox) {
    try {
      log.info('Sending email notification to', {
        requestedBy: dropbox.requestedBy.name
      });

      const personalisation = {
        name: dropbox.requestedBy.name,
        linkToDropbox: `/dropboxes/${dropbox.id}/view`
      };

      return client
        .sendEmail(
          process.env.GOV_NOTIFY_TEMPLATE_ID,
          dropbox.requestedBy.email,
          {
            personalisation,
            reference: null //should be a unique identifier but could be null
          }
        )
        .then(response => console.log(response))
        .catch(err => console.error(err));
    } catch (err) {
      log.error('Failed sending notification', { error: err });
    }
  }

  return { send };
};
