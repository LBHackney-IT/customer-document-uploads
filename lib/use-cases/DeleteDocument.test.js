describe('use-case/delete document', () => {
  const options = {
    gateways: {
      evidenceStore: {
        deleteByDocumentId: jest.fn(() => Promise.resolve())
      }
    }
  };

  const deleteDocument = require('./DeleteDocument')(options);

  it('deletes the document from the dropbox', async () => {
    const documentId = 'doc98765';
    await deleteDocument(documentId);

    expect(
      options.gateways.evidenceStore.deleteByDocumentId
    ).toHaveBeenCalledWith(documentId);
  });
});
