describe('use-case/get secure upload url', () => {
  const expectedUploadUrl = 'upload/url';

  const options = {
    gateways: {
      document: {
        createUploadUrl: jest.fn(() => expectedUploadUrl)
      }
    }
  };

  const getSecureUploadUrl = require('./GetSecureUploadUrl')(options);

  it('creates a suitable upload url', async () => {
    const dropboxId = 'db123456';
    const uploadUrl = await getSecureUploadUrl(dropboxId);

    expect(options.gateways.document.createUploadUrl).toHaveBeenCalledWith(
      dropboxId,
      expect.any(String)
    );

    expect(uploadUrl).toBe(expectedUploadUrl);
  });
});
