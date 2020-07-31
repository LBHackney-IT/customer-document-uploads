describe('GetEvidenceStoreUrl', () => {
  const expectedDocumentId = 'abst39';
  const expectedUploadUrl = 'upload/url';
  const options = {
    gateways: {
      evidenceStore: {
        createUploadUrl: jest.fn(() =>
          Promise.resolve({
            url: expectedUploadUrl,
            fields: {},
            documentId: expectedDocumentId
          })
        )
      }
    }
  };

  const getEvidenceStoreUrl = require('./GetEvidenceStoreUrl')(options);

  it('creates a suitable upload url', async () => {
    const dropboxId = 'db123456';

    const metadata = {
      firstName: ['Joe'],
      lastName: ['Bloggs'],
      dob: ['1969-02-01 12:00:00'],
      'systemId.jigsaw': ['123']
    };

    const { url, documentId } = await getEvidenceStoreUrl({
      dropboxId,
      metadata
    });

    expect(
      options.gateways.evidenceStore.createUploadUrl
    ).toHaveBeenCalledWith({ dropboxId, metadata });

    expect(url).toBe(expectedUploadUrl);
    expect(documentId).toStrictEqual(expectedDocumentId);
  });
});
