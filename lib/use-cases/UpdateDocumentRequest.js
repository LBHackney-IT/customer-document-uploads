const { DocumentRequest } = require('../domain/document-request');

module.exports = ({ gateways: { request } }) => {
  return async docRequest => {
    await request.update(docRequest);
  };
};
