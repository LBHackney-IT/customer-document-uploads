const { Document } = require('../../domain/dropbox');

/**
 * Gateway that provides documents that belong to dropboxes from Amazon S3.
 */
module.exports = ({ client, bucketName }) => {
  function getDocumentMetadata(key) {
    return new Promise((resolve, reject) => {
      client.headObject(
        {
          Bucket: bucketName,
          Key: key
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }

          return resolve({
            filename: data.Metadata['x-amz-meta-filename'],
            description: data.Metadata['x-amz-meta-description']
          });
        }
      );
    });
  }

  function getDownloadUrl(key) {
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
    return new Promise((resolve, reject) => {
      client.listObjectsV2(
        {
          Bucket: bucketName,
          Prefix: `${dropboxId}/`
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }

          const documents = data.Contents.map(async ({ Key }) => {
            const { filename, description } = await getDocumentMetadata(Key);

            return new Document({
              id: Key.split('/').reverse()[0],
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
    return client.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: `${dropboxId}/${documentId}`,
      Expires: 3600
    });
  }

  /**
   * Deletes a given object from a given dropbox.
   * @param {String} dropboxId the id of the dropbox
   * @param {String} documentId the id of the document to delete
   */
  function deleteFromDropbox(dropboxId, documentId) {
    return new Promise((resolve, reject) => {
      client.deleteObject(
        {
          Bucket: bucketName,
          Key: `${dropboxId}/${documentId}`
        },
        err => {
          if (err) {
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
