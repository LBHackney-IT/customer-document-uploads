const { DocumentRequest } = require('../../domain/document-request');

const toDocumentRequestModel = request => ({
  requestId: request.id,
  created: request.created,
  dropboxId: request.dropboxId,
  metadata: request.metadata
});

const fromDocumentRequestModel = model => {
  if (!model) return null;
  return new DocumentRequest({
    id: model.dropboxId,
    created: model.created,
    dropboxId: model.dropboxId,
    metadata: model.metadata
  });
};

module.exports = ({ client, configuration, log }) => {
  const tableName = configuration.tables.requests;

  /**
   * Saves a document request.
   * @param {DocumentRequest} request the document request
   */
  function save(request) {
    log.info('Saving document request', { requestId: request.id });
    return new Promise((resolve, reject) => {
      client.put(
        {
          TableName: tableName,
          Item: toDocumentRequestModel(request)
        },
        err => {
          if (err) {
            log.error('Failed saving document request', { error: err });
            return reject(err);
          }
          return resolve(request);
        }
      );
    });
  }

  return { save };
};
