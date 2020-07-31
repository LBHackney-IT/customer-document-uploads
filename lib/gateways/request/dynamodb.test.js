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

  // const dropboxRecord = {
  //   dropboxId: 'dropbox-1',
  //   created: '2020-04-26T16:00:00+0000',
  //   submitted: '2020-04-26T18:00:00+0000',
  //   description: 'A test dropbox',
  //   customerName: 'Bob Sleigh',
  //   customerPhone: '01234567890',
  //   customerEmail: 'bob@example.com',
  //   customerNationalInsurance: 'AB111111C',
  //   customerReference: 'abc'
  // };

  // describe('get', () => {
  // it('returns null if nothing is found', async () => {
  //   options.client.get.mockImplementation((_, cb) => {
  //     cb(null, { Item: null });
  //   });
  //   const gateway = createDocumentGateway(options);
  //   const dropbox = await gateway.get('dropbox-1');
  //   expect(dropbox).toBeNull();
  // });
  // it('returns a dropbox', async () => {
  //   options.client.get.mockImplementation((_, cb) => {
  //     cb(null, { Item: dropboxRecord });
  //   });
  //   const gateway = createDocumentGateway(options);
  //   const dropbox = await gateway.get('dropbox-1');
  //   expect(dropbox).toBeInstanceOf(Dropbox);
  //   expect(dropbox).toStrictEqual(
  //     expect.objectContaining({
  //       id: dropboxRecord.dropboxId,
  //       created: dropboxRecord.created,
  //       submitted: dropboxRecord.submitted,
  //       description: dropboxRecord.description,
  //       customer: expect.objectContaining({
  //         name: dropboxRecord.customerName,
  //         phone: dropboxRecord.customerPhone,
  //         email: dropboxRecord.customerEmail,
  //         reference: dropboxRecord.customerReference,
  //         dob: dropboxRecord.customerDob,
  //         nationalInsurance: dropboxRecord.customerNationalInsurance
  //       })
  //     })
  //   );
  // });
  // });

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
