module.exports = ({ client, log }) => {
  function send(dropbox, requestedBy, requestedByEmail) {
    try {
      log.info('Sending email notification to', {
        requestedBy
      });

      const personalisation = {
        name: requestedBy,
        residentName: dropbox.customerName,
        description: dropbox.description,
        linkToDropbox: `${process.env.URL_PREFIX}/dropboxes/${dropbox.id}/view`
      };

      return client
        .sendEmail(process.env.GOV_NOTIFY_TEMPLATE_ID, requestedByEmail, {
          personalisation,
          reference: null
        })
        .then(response => console.log(response))
        .catch(err => console.error(err));
    } catch (err) {
      log.error('Failed sending notification', { error: err });
    }
  }

  return { send };
};
