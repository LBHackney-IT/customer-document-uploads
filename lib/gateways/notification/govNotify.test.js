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

    it('calls gov notifye API with the dropbox id', async () => {
      const dropbox = {
        requestedBy: {
          name: 'Foo',
          email: 'foo@email.co.uk',
          id: '1'
        }
      };
      await gateway.send(dropbox);
      expect(client.sendEmail).toHaveBeenCalledWith(
        process.env.GOV_NOTIFY_TEMPLATE_ID,
        'foo@email.co.uk',
        {
          personalisation: {
            name: 'Foo',
            linkToDropbox: `/dropboxes/${dropbox.id}/view`
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
