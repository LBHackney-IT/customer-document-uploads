describe('use-case/delete document', () => {
  const options = {
    gateways: {
      document: {
        deleteFromDropbox: jest.fn(() => Promise.resolve())
      }
    }
  };

  const deleteDocument = require('./DeleteDocument')(options);

  it('deletes the document from the dropbox', async () => {
    const dropboxId = 'db123456';
    const documentId = 'doc98765';
    await deleteDocument(dropboxId, documentId);

    expect(options.gateways.document.deleteFromDropbox).toHaveBeenCalledWith(
      dropboxId,
      documentId
    );
  });
});
