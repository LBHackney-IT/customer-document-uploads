const { Dropbox, Customer } = require('../../domain/dropbox');

const toDropboxModel = dropbox => ({
  dropboxId: dropbox.id,
  created: dropbox.created,
  submitted: dropbox.submitted,
  description: dropbox.description,
  archived: dropbox.archived,
  customerName: dropbox.customer && dropbox.customer.name,
  customerDob: dropbox.customer && dropbox.customer.dob,
  customerPhone: dropbox.customer && dropbox.customer.phone,
  customerEmail: dropbox.customer && dropbox.customer.email,
  customerReference: dropbox.customer && dropbox.customer.reference,
  customerNationalInsurance:
    dropbox.customer && dropbox.customer.nationalInsurance
});

const fromDropboxModel = model => {
  if (!model) {
    return null;
  }

  return new Dropbox({
    id: model.dropboxId,
    created: model.created,
    submitted: model.submitted,
    description: model.description,
    archived: model.archived,
    customer:
      model.customerName &&
      new Customer({
        name: model.customerName,
        phone: model.customerPhone,
        email: model.customerEmail,
        reference: model.customerReference,
        dob: model.customerDob,
        nationalInsurance: model.customerNationalInsurance
      })
  });
};

module.exports = ({ client, configuration, log }) => {
  const tableName = configuration.tables.dropboxes;

  /**
   * Saves a dropbox.
   * @param {Dropbox} dropbox the dropbox
   */
  function save(dropbox) {
    log.info('Saving dropbox', { dropboxId: dropbox.id });
    return new Promise((resolve, reject) => {
      client.put(
        {
          TableName: tableName,
          Item: toDropboxModel(dropbox)
        },
        err => {
          if (err) {
            log.error('Failed saving dropbox', { error: err });
            return reject(err);
          }

          return resolve(dropbox);
        }
      );
    });
  }

  function get(dropboxId) {
    log.info('Getting dropbox', { dropboxId });
    return new Promise((resolve, reject) => {
      client.get(
        {
          Key: { dropboxId },
          TableName: tableName
        },
        (err, data) => {
          if (err) {
            log.error('Failed getting dropbox', { dropboxId, error: err });
            return reject(err);
          }

          const item = data.Item;
          return resolve(fromDropboxModel(item));
        }
      );
    });
  }

  function list() {
    log.info('Listing dropboxes');
    return new Promise((resolve, reject) => {
      client.scan({ TableName: tableName }, (err, data) => {
        if (err) {
          log.error('Failed listing dropboxes', { error: err });
          return reject(err);
        }

        log.info(`Found ${data.Items.length} dropboxes`);
        return resolve(data.Items.map(fromDropboxModel));
      });
    });
  }

  return { save, get, list };
};
