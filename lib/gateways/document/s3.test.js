const { Document } = require('../../domain/dropbox');
const createS3Gateway = require('./s3');

describe('gateway/document/S3', () => {
  const dropboxId = 'dropbox-1';
  const expectedSignedUrl = '//signed/url';
  const options = {
    client: {
      listObjectsV2: jest.fn(),
      headObject: jest.fn(),
      getSignedUrl: jest.fn(() => ({
        promise: () => Promise.resolve(expectedSignedUrl)
      }))
    },
    bucketName: 'test-bucket'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUploadUrl', () => {
    it('creates a signed upload URL for a document', async () => {
      const gateway = createS3Gateway(options);
      const documentId = 'document-1';
      const url = await gateway.createUploadUrl(dropboxId, documentId);

      expect(url).toBe(expectedSignedUrl);
      expect(options.client.getSignedUrl).toHaveBeenCalledWith(
        'putObject',
        expect.objectContaining({
          Bucket: options.bucketName,
          Key: `/${dropboxId}/${documentId}`
        })
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
          Contents: [{ Key: `${params.Prefix}${documentId}` }]
        });
      });

      options.client.headObject.mockImplementation((_, cb) => {
        cb(null, {
          Metadata: {
            'x-amz-meta-filename': filename,
            'x-amz-meta-description': description
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