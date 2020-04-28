describe('use-case/get secure upload url', () => {
  const expectedUploadUrl = 'upload/url';

  const options = {
    gateways: {
      document: {
        createUploadUrl: jest.fn(() =>
          Promise.resolve({
            url: expectedUploadUrl,
            fields: {}
          })
        )
      }
    }
  };

  const getSecureUploadUrl = require('./GetSecureUploadUrl')(options);

  it('creates a suitable upload url', async () => {
    const dropboxId = 'db123456';
    const { url, documentId } = await getSecureUploadUrl(dropboxId);

    expect(options.gateways.document.createUploadUrl).toHaveBeenCalledWith(
      dropboxId,
      expect.any(String)
    );

    expect(url).toBe(expectedUploadUrl);
    expect(documentId).toStrictEqual(expect.any(String));
  });
});
