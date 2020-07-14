const nock = require('nock');
const EvidenceStoreGateway = require('./EvidenceStoreGateway');

describe('gateway/evidenceStore', () => {
  let scope;
  const gateway = new EvidenceStoreGateway({
    baseUrl: 'http://localhost:5050'
  });

  const expectedDropboxId = 'ajs83jhdl';

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

  describe('createUploadUrl', () => {
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
});
