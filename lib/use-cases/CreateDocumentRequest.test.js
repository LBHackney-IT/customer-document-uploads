const { DocumentRequest } = require('../domain/document-request');
const CreateDocumentRequest = require('./CreateDocumentRequest');

describe('use-case/create document request', () => {
  const options = {
    gateways: {
      request: {
        save: jest.fn(item => Promise.resolve(item))
      }
    }
  };

  const createDocumentRequest = CreateDocumentRequest(options);

  it('creates a new document request', async () => {
    const metadata = {
      firstName: ['Joe'],
      lastName: ['Bloggs'],
      dob: ['1969-02-01 12:00:00'],
      'systemId.jigsaw': ['123']
    };

    const request = await createDocumentRequest(metadata);

    expect(request).toBeInstanceOf(DocumentRequest);
    expect(options.gateways.request.save).toHaveBeenCalledWith(request);
  });
});
