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
    id: model.requestId,
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

  /**
   * Gets a document request.
   * @param {string} requestId the document request id
   */
  function get(requestId) {
    log.info('Getting document request', { requestId });
    return new Promise((resolve, reject) => {
      client.get(
        {
          Key: { requestId },
          TableName: tableName
        },
        (err, data) => {
          if (err) {
            log.error('Failed getting document request', {
              requestId,
              error: err
            });
            return reject(err);
          }

          const item = data.Item;
          return resolve(fromDocumentRequestModel(item));
        }
      );
    });
  }

  /**
   * Updates a document request.
   * @param {DocumentRequest} request the document request
   */
  function update(request) {
    log.info('Updating document request', { requestId: request.id });
    const model = toDocumentRequestModel(request);
    return new Promise((resolve, reject) => {
      client.update(
        {
          TableName: tableName,
          Key: { requestId: request.id },
          UpdateExpression: 'set dropboxId = :d',
          ExpressionAttributeValues: {
            ':d': model.dropboxId
          }
        },
        err => {
          if (err) {
            log.error('Failed updating document request', { error: err });
            return reject(err);
          }
          return resolve(request);
        }
      );
    });
  }

  return { get, save, update };
};
