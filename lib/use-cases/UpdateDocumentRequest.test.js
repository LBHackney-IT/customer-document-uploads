const { DocumentRequest } = require('../domain/document-request');
const UpdateDocumentRequest = require('./UpdateDocumentRequest');

describe('use-case/update document request', () => {
  const options = {
    gateways: {
      request: {
        update: jest.fn()
      }
    }
  };

  const updateDocumentRequest = UpdateDocumentRequest(options);

  it('updates a document request', async () => {
    const request = new DocumentRequest({
      id: '123',
      created: 'date',
      dropboxId: 'dropbox-1',
      metadata: { x: '123' }
    });

    await updateDocumentRequest(request);
    expect(options.gateways.request.update).toHaveBeenCalledWith(request);
  });
});
