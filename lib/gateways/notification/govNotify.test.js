const govNotify = require('./govNotify');

describe('gateway/govNotify', () => {
  const client = {
    sendEmail: jest.fn()
  };
  const log = {
    info: jest.fn(),
    error: jest.fn()
  };
  const gateway = govNotify({ client, log });

  describe('send email notification', () => {
    beforeEach(() => {});

    it('calls gov notify API with the dropbox id', async () => {
      const dropbox = {
        customerName: 'Bar',
        description: 'baz'
      };
      const requestedBy = {
        name: 'Foo',
        email: 'foo@email.co.uk',
        id: '1'
      };
      await gateway.send(dropbox, requestedBy);
      expect(client.sendEmail).toHaveBeenCalledWith(
        process.env.GOV_NOTIFY_TEMPLATE_ID,
        'foo@email.co.uk',
        {
          personalisation: {
            name: 'Foo',
            residentName: 'Bar',
            description: 'baz',
            linkToDropbox: `${process.env.URL_PREFIX}/dropboxes/${dropbox.id}/view`
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
