const { DocumentRequest } = require('../domain/document-request');

module.exports = ({ gateways: { request } }) => {
  return async metadata => {
    const docRequest = DocumentRequest.create(metadata);
    return await request.save(docRequest);
  };
};
