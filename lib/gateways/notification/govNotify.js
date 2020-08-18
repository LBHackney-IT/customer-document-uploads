module.exports = ({ client, log, configuration }) => {
  function send(dropbox, requestedBy, requestedByEmail) {
    try {
      log.info('Sending email notification to', {
        requestedBy
      });

      const personalisation = {
        name: requestedBy,
        residentName: dropbox.customerName,
        description: dropbox.description,
        linkToDropbox: `${configuration.urlPrefix}/dropboxes/${dropbox.id}/view`
      };

      return new Promise((resolve, reject) => {
        client
          .sendEmail(configuration.govNotifyTemplateId, requestedByEmail, {
            personalisation,
            reference: null
          })
          .then(response => resolve(response))
          .catch(err => {
            console.error(err);
            reject(err);
          });
      });
    } catch (err) {
      log.error('Failed sending notification', { error: err });
    }
  }

  return { send };
};
