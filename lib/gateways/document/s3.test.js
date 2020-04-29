const { Document } = require('../../domain/dropbox');
const createS3Gateway = require('./s3');

describe('gateway/document/S3', () => {
  const dropboxId = 'dropbox-1';
  const expectedSignedUrl = '//signed/url';
  const urlPrefix = 'http://uploads.example.com';
  const maxUploadBytes = 1024;
  const options = {
    client: {
      listObjectsV2: jest.fn(),
      headObject: jest.fn(),
      getSignedUrl: jest.fn(() => expectedSignedUrl),
      deleteObject: jest.fn(),
      createPresignedPost: jest.fn((_, cb) =>
        cb(null, {
          url: expectedSignedUrl,
          fields: { bucket: 'test-bucket' }
        })
      )
    },
    bucketName: 'test-bucket',
    log: { info: jest.fn(), error: jest.fn() },
    configuration: { urlPrefix, maxUploadBytes }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUploadUrl', () => {
    it('creates a signed upload URL for a document', async () => {
      const gateway = createS3Gateway(options);
      const documentId = 'document-1';

      const { url } = await gateway.createUploadUrl(dropboxId, documentId);

      expect(options.client.createPresignedPost).toHaveBeenCalledWith(
        expect.objectContaining({
          Fields: expect.objectContaining({
            success_action_redirect: `${urlPrefix}/dropboxes/${dropboxId}`
          }),
          Conditions: expect.arrayContaining([
            ['content-length-range', 1, maxUploadBytes]
          ])
        }),
        expect.any(Function)
      );

      expect(url).toBe(expectedSignedUrl);
    });
  });

  describe('deleteFromDropbox', () => {
    it('deletes the object from S3', async () => {
      const dropboxId = 'box12345';
      const documentId = 'doc12345';
      const filename = 'file.txt';

      options.client.listObjectsV2.mockImplementation((_, cb) => {
        cb(null, {
          Contents: [{ Key: `${dropboxId}/${documentId}/${filename}` }]
        });
      });

      options.client.headObject.mockImplementation((_, cb) => {
        cb(null, { Metadata: {} });
      });

      options.client.deleteObject.mockImplementation((_, cb) => {
        cb(null, {});
      });

      const gateway = createS3Gateway(options);
      await gateway.deleteFromDropbox(dropboxId, documentId);

      expect(options.client.deleteObject).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: `${dropboxId}/${documentId}/${filename}`,
          Bucket: options.bucketName
        }),
        expect.any(Function)
      );
    });
  });

  describe('getByDropboxId', () => {
    it('returns a list of documents within a dropbox', async () => {
      const documentId = 'document-1';
      const filename = 'my-cat.jpg';
      const description = 'Photo of my cat';

      options.client.listObjectsV2.mockImplementation((params, cb) => {
        cb(null, {
          Contents: [{ Key: `${params.Prefix}${documentId}/${filename}` }]
        });
      });

      options.client.headObject.mockImplementation((_, cb) => {
        cb(null, {
          Metadata: {
            description: description
          }
        });
      });

      const gateway = createS3Gateway(options);
      const documents = await gateway.getByDropboxId(dropboxId);

      expect(documents.length).toBe(1);

      const [document] = documents;
      expect(document).toBeInstanceOf(Document);
      expect(document).toStrictEqual(
        expect.objectContaining({
          id: documentId,
          filename,
          description,
          downloadUrl: expectedSignedUrl
        })
      );
    });
  });
});
