const govNotify = require('./govNotify');

describe('gateway/govNotify', () => {
  const client = {
    sendEmail: jest.fn(() => {
      return Promise.resolve();
    })
  };
  const log = {
    info: jest.fn(),
    error: jest.fn()
  };
  const configuration = {
    urlPrefix: 'prefix',
    govNotifyTemplateId: 'template_id'
  };
  const gateway = govNotify({ client, log, configuration });

  describe('send email notification', () => {
    beforeEach(() => {});

    it('calls gov notify API with the dropbox id', async () => {
      const dropbox = {
        customer: { name: 'Bar' },
        description: 'baz',
        id: '1'
      };
      const requestedBy = 'Foo';
      const requestedByEmail = 'foo@email.co.uk';
      await gateway.send(dropbox, requestedBy, requestedByEmail);
      expect(client.sendEmail).toHaveBeenCalledWith(
        'template_id',
        'foo@email.co.uk',
        {
          personalisation: {
            name: 'Foo',
            residentName: 'Bar',
            description: 'baz',
            linkToDropbox: `prefix/dropboxes/1/view`
          },
          reference: null
        }
      );
    });

    it('throws an error if API call fails', async () => {
      client.sendEmail.mockImplementation(() => {
        return Promise.resolve(new Error());
      });

      await expect(() => gateway.send(dropbox).rejects.toThrow());
    });
  });
});
