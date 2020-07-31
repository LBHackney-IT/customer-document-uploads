const { DocumentRequest } = require('../domain/document-request');
const GetDocumentRequest = require('./GetDocumentRequest');

describe('use-case/get document request', () => {
  const options = {
    gateways: {
      request: {
        get: jest.fn()
      }
    }
  };

  const getDocumentRequest = GetDocumentRequest(options);

  it('gets a document request', async () => {
    const requestId = '123456';
    const request = await getDocumentRequest(requestId);
    expect(options.gateways.request.get).toHaveBeenCalledWith(requestId);
  });

  it('returns null if does not exist', async () => {
    options.gateways.request.get.mockImplementation(() => {
      return Promise.resolve(null);
    });

    const request = await getDocumentRequest('123456');
    expect(request).toBeNull();
  });
});
