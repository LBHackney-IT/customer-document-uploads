const { Customer } = require('../domain/dropbox');

function isValidNonEmptyString(input) {
  if (typeof input === 'string') {
    return input.trim().length > 0;
  }

  return false;
}

function validValueOrNull(input) {
  return isValidNonEmptyString(input) ? input.trim() : null;
}

module.exports = ({ gateways: { dropbox: dropboxes } }) => {
  return async (dropboxId, fields) => {
    const dropbox = await dropboxes.get(dropboxId);

    if (!dropbox) {
      throw new Error('Invalid dropbox');
    }

    const { description, customerName, customerEmail, customerPhone } = fields;

    dropbox.description = validValueOrNull(description);

    if (isValidNonEmptyString(customerName)) {
      dropbox.assign(
        new Customer({
          name: customerName,
          phone: validValueOrNull(customerPhone),
          email: validValueOrNull(customerEmail)
        })
      );

      await dropboxes.save(dropbox);
    }
  };
};
