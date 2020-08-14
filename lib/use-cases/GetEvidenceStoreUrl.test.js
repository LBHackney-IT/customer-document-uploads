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
        ),
        getByDropboxId: jest.fn(),
        getUploadUrl: jest.fn(() => ({
          url: 'x',
          fields: {},
          documentId: 'x'
        }))
      }
    }
  };
  const getEvidenceStoreUrl = require('./GetEvidenceStoreUrl')(options);

  it('creates a suitable upload url', async () => {
    options.gateways.evidenceStore.getByDropboxId = jest.fn(() => {
      return [
        {
          id: 'document-1',
          description: 'Photo of my cat',
          filename: 'my-cat.jpg',
          downloadUrl: 'http://localhost:5050/document-1/contents'
        }
      ];
    });
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

  it('gets a url for an unused document if there is one', async () => {
    options.gateways.evidenceStore.getByDropboxId = jest.fn(() => {
      return [
        {
          id: 'document-1',
          description: 'Photo of my cat',
          filename: 'my-cat.jpg',
          downloadUrl: 'http://localhost:5050/document-1/contents'
        },
        {
          id: 'document-2'
        }
      ];
    });

    await getEvidenceStoreUrl({ documentId: 'db123456' });

    expect(options.gateways.evidenceStore.getByDropboxId).toHaveBeenCalled();
    expect(options.gateways.evidenceStore.getUploadUrl).toHaveBeenCalledWith(
      'document-2'
    );
  });
});
