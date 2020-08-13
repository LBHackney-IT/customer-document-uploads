const nock = require('nock');
const { Document } = require('../../domain/dropbox');
const EvidenceStoreGateway = require('./EvidenceStoreGateway');

describe('gateway/evidenceStore', () => {
  const gateway = new EvidenceStoreGateway({
    baseUrl: 'http://localhost:5050'
  });

  const expectedDropboxId = 'ajs83jhdl';

  describe('createUploadUrl', () => {
    let scope;
    beforeEach(() => {
      scope = nock('http://localhost:5050')
        .post('/metadata', { dropboxId: expectedDropboxId })
        .reply(201, {
          documentId: 'ajs873',
          url: 'https://secure.upload.url',
          fields: {
            'X-Amz-Random-Header': 'value'
          }
        });
    });

    it('calls Evidence Store API with the dropbox id', async () => {
      await gateway.createUploadUrl(expectedDropboxId);
      expect(scope.isDone()).toBe(true);
    });

    it('returns correct url and fields', async () => {
      const result = await gateway.createUploadUrl(expectedDropboxId);
      expect(result.url).toStrictEqual('https://secure.upload.url');
      expect(result.fields).toStrictEqual({ 'X-Amz-Random-Header': 'value' });
    });

    it('returns the document id', async () => {
      const result = await gateway.createUploadUrl(expectedDropboxId);
      expect(result.documentId).toStrictEqual('ajs873');
    });

    it('throws an error if API call fails', async () => {
      const errorScope = nock('http://localhost:5050')
        .post('/metadata', { dropboxId: '123456' })
        .reply(500);

      await expect(() => gateway.createUploadUrl('123456')).rejects.toThrow();
      expect(errorScope.isDone()).toBe(true);
    });

    it('throws an error if API call times out', async () => {
      const errorScope = nock('http://localhost:5050')
        .post('/metadata', { dropboxId: '123456' })
        .replyWithError({ code: 'ETIMEDOUT' });

      await expect(() => gateway.createUploadUrl('123456')).rejects.toThrow();
      expect(errorScope.isDone()).toBe(true);
    });
  });

  describe('getUploadUrl', () => {
    const expectedDocumentId = 'xx123';
    let scope;
    beforeEach(() => {
      scope = nock('http://localhost:5050')
        .get('/xx123/upload-url')
        .reply(200, {
          documentId: 'xx123',
          url: 'https://secure.upload.url',
          fields: {
            'X-Amz-Random-Header': 'value'
          }
        });
    });

    it('calls Evidence Store API with the dropbox id', async () => {
      await gateway.getUploadUrl(expectedDocumentId);
      expect(scope.isDone()).toBe(true);
    });

    it('returns correct url and fields', async () => {
      const result = await gateway.getUploadUrl(expectedDocumentId);
      expect(result.url).toStrictEqual('https://secure.upload.url');
      expect(result.fields).toStrictEqual({ 'X-Amz-Random-Header': 'value' });
    });

    it('returns the document id', async () => {
      const result = await gateway.getUploadUrl(expectedDocumentId);
      expect(result.documentId).toStrictEqual(expectedDocumentId);
    });

    it('throws an error if API call fails', async () => {
      const errorScope = nock('http://localhost:5050')
        .get('/123456/upload-url')
        .reply(500);

      await expect(() => gateway.getUploadUrl('123456')).rejects.toThrow();
      expect(errorScope.isDone()).toBe(true);
    });

    it('throws an error if API call times out', async () => {
      const errorScope = nock('http://localhost:5050')
        .get('/123456/upload-url')
        .replyWithError({ code: 'ETIMEDOUT' });

      await expect(() => gateway.getUploadUrl('123456')).rejects.toThrow();
      expect(errorScope.isDone()).toBe(true);
    });
  });

  describe('deleteByDocumentId', () => {
    it('requests that the document is deleted', async () => {
      const scope = nock('http://localhost:5050')
        .delete('/ab92js')
        .reply(204);

      await gateway.deleteByDocumentId('ab92js');
      expect(scope.isDone()).toBe(true);
    });
  });

  describe('getByDropboxId', () => {
    it('returns a list of documents within a dropbox', async () => {
      const documentId = 'document-1';
      const filename = 'my-cat.jpg';
      const description = 'Photo of my cat';
      const expectedSignedUrl = `http://localhost:5050/${documentId}/contents`;

      nock('http://localhost:5050')
        .post('/search', { dropboxId: expectedDropboxId })
        .reply(200, {
          documents: [
            {
              metadata: {
                documentId,
                description,
                filename
              },
              downloadUrl: expectedSignedUrl
            }
          ]
        });

      const documents = await gateway.getByDropboxId(expectedDropboxId);

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
