module.exports = ({ client, log }) => {
  function send(dropbox, requestedBy) {
    try {
      log.info('Sending email notification to', {
        requestedBy: requestedBy.name
      });

      const personalisation = {
        name: requestedBy.name,
        residentName: dropbox.customerName,
        description: dropbox.description,
        linkToDropbox: `/dropboxes/${dropbox.id}/view`
      };

      console.log('sending' + JSON.stringify(personalisation));
      return client
        .sendEmail(process.env.GOV_NOTIFY_TEMPLATE_ID, requestedBy.email, {
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
