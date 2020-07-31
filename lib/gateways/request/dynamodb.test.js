const { DocumentRequest } = require('../../domain/document-request');
const documentRequestGateway = require('./dynamodb');

describe('gateways/request/DynamoDB', () => {
  const options = {
    client: {
      get: jest.fn(),
      put: jest.fn()
    },
    configuration: {
      tables: {
        requests: 'RequestsTable'
      }
    },
    log: { info: jest.fn(), error: jest.fn() }
  };

  describe('get', () => {
    it('returns null if nothing is found', async () => {
      options.client.get.mockImplementation((_, cb) => {
        cb(null, { Item: null });
      });
      const gateway = documentRequestGateway(options);

      const request = await gateway.get('123456');

      expect(request).toBeNull();
    });

    it('returns a document request', async () => {
      const request = {
        requestId: 'request-1',
        created: '2020-04-26T16:00:00+0000',
        dropboxId: '123',
        metadata: { firstName: ['Mary'] }
      };
      options.client.get.mockImplementation((_, cb) => {
        cb(null, { Item: request });
      });
      const gateway = documentRequestGateway(options);

      const docRequest = await gateway.get('request-1');

      expect(docRequest).toBeInstanceOf(DocumentRequest);
      expect(docRequest).toStrictEqual(
        expect.objectContaining({
          id: request.requestId,
          created: request.created,
          dropboxId: request.dropboxId,
          metadata: request.metadata
        })
      );
    });
  });

  describe('save', () => {
    let request;

    beforeEach(() => {
      const metadata = {
        firstName: ['Joe'],
        lastName: ['Bloggs'],
        dob: ['1969-02-01 12:00:00'],
        'systemId.jigsaw': ['123']
      };
      request = DocumentRequest.new(metadata);
      options.client.put.mockImplementation((_, cb) => cb(null, {}));
    });

    it('saves a request', async () => {
      const gateway = documentRequestGateway(options);

      await gateway.save(request);

      expect(options.client.put).toHaveBeenCalledWith(
        expect.objectContaining({
          TableName: options.configuration.tables.requests,
          Item: expect.objectContaining({
            requestId: request.id,
            created: request.created,
            dropboxId: request.dropboxId,
            metadata: request.metadata
          })
        }),
        expect.any(Function)
      );
    });
  });
});
