const { Document } = require('../../domain/dropbox');

/**
 * Gateway that provides documents that belong to dropboxes from Amazon S3.
 */
module.exports = ({
  client,
  bucketName,
  log,
  configuration: { urlPrefix, maxUploadBytes }
}) => {
  function getDocumentMetadata(key) {
    log.info('Fetching document metadata', { key });
    return new Promise((resolve, reject) => {
      client.headObject(
        {
          Bucket: bucketName,
          Key: key
        },
        (err, data) => {
          if (err) {
            log.error('Failed fetching metadata', { key, error: err });
            return reject(err);
          }

          const { description } = data.Metadata;
          return resolve({ description });
        }
      );
    });
  }

  function getDownloadUrl(key) {
    log.info('Generating pre-signed download url', { key });
    return client.getSignedUrl('getObject', {
      Bucket: bucketName,
      Key: key,
      Expires: 60
    });
  }

  /**
   * Fetches all documents that have been uploaded to a given dropbox.
   * @param {String} dropboxId the id of the dropbox
   */
  function getByDropboxId(dropboxId) {
    log.info('Listing documents in dropbox', { dropboxId });
    return new Promise((resolve, reject) => {
      client.listObjectsV2(
        {
          Bucket: bucketName,
          Prefix: `${dropboxId}/`
        },
        (err, data) => {
          if (err) {
            log.error('Failing listing S3 contents', { dropboxId, error: err });
            return reject(err);
          }

          const documents = data.Contents.map(async ({ Key }) => {
            log.info('Iterating', { key: Key });
            const { description } = await getDocumentMetadata(Key);

            const [, documentId, filename] = Key.split('/');
            return new Document({
              id: documentId,
              filename,
              description,
              downloadUrl: await getDownloadUrl(Key)
            });
          });

          Promise.all(documents)
            .then(resolve)
            .catch(reject);
        }
      );
    });
  }

  /**
   * Creates a URL that can be used to upload a new document to the dropbox.
   * @param {String} dropboxId the id of the dropbox
   * @param {String} documentId the id of the new document
   */
  function createUploadUrl(dropboxId, documentId) {
    log.info('Generating pre-signed upload url', { dropboxId, documentId });
    return new Promise((resolve, reject) => {
      client.createPresignedPost(
        {
          Bucket: bucketName,
          Expires: 3600,
          Fields: {
            success_action_redirect: `${urlPrefix}/dropboxes/${dropboxId}`
          },
          Conditions: [
            { bucket: bucketName },
            ['starts-with', '$key', `${dropboxId}/${documentId}/`],
            { 'X-Amz-Server-Side-Encryption': 'AES256' },
            ['starts-with', '$X-Amz-Meta-Description', ''],
            ['content-length-range', 1, maxUploadBytes]
          ]
        },
        (err, data) => {
          if (err) {
            log.error('Failed generating pre-signed upload url', {
              error: err
            });

            return reject(err);
          }

          return resolve(data);
        }
      );
    });
  }

  /**
   * Deletes a given object from a given dropbox.
   * @param {String} dropboxId the id of the dropbox
   * @param {String} documentId the id of the document to delete
   */
  async function deleteFromDropbox(dropboxId, documentId) {
    log.info('Deleting document', { dropboxId, documentId });

    const documents = await this.getByDropboxId(dropboxId);
    const document = documents.find(doc => doc.id === documentId);

    if (!document) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      client.deleteObject(
        {
          Bucket: bucketName,
          Key: `${dropboxId}/${documentId}/${document.filename}`
        },
        err => {
          if (err) {
            log.error('Failed deleting document', { error: err });
            return reject(err);
          }

          return resolve();
        }
      );
    });
  }

  return {
    getByDropboxId,
    createUploadUrl,
    deleteFromDropbox
  };
};
