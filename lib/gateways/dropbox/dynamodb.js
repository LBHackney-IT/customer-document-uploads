const { Dropbox, Customer } = require('../../domain/dropbox');

const toDropboxModel = dropbox => ({
  dropboxId: dropbox.id,
  created: dropbox.created,
  submitted: dropbox.submitted,
  description: dropbox.description,
  customerName: dropbox.customer.name,
  customerPhone: dropbox.customer.phone,
  customerEmail: dropbox.customer.email
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
    customer: new Customer({
      name: model.customerName,
      phone: model.customerPhone,
      email: model.customerEmail
    })
  });
};

module.exports = ({ client, configuration }) => {
  const tableName = configuration.tables.dropboxes;

  /**
   * Saves a dropbox.
   * @param {Dropbox} dropbox the dropbox
   */
  function save(dropbox) {
    return new Promise((resolve, reject) => {
      client.put(
        {
          TableName: tableName,
          Item: toDropboxModel(dropbox)
        },
        err => {
          if (err) {
            return reject(err);
          }

          return resolve(dropbox);
        }
      );
    });
  }

  function get(id) {
    return new Promise((resolve, reject) => {
      client.get(
        {
          Key: { id },
          TableName: tableName
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }

          const item = data.Item;
          return resolve(fromDropboxModel(item));
        }
      );
    });
  }

  function list() {
    return new Promise((resolve, reject) => {
      client.scan({ TableName: tableName }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return resolve(data.Items.map(fromDropboxModel));
      });
    });
  }

  return { save, get, list };
};
