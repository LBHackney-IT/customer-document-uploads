const { Dropbox } = require('../domain/dropbox');

describe('use-case/SendNotification', () => {
  const options = {
    gateways: {
      dropbox: {
        get: jest.fn(),
        save: jest.fn(dropbox => Promise.resolve(dropbox))
      },
      notify: {
        send: jest.fn()
      },
      evidenceStore: {
        getByDropboxId: jest.fn()
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const sendNotification = require('./SendNotification')(options);

  describe('with no requestedBy field', () => {
    const expectedDropbox = new Dropbox({
      id: 'abc123456',
      created: '2020-04-26T18:00:00+0000',
      description: 'A test dropbox'
    });

    beforeEach(() => {
      options.gateways.dropbox.get.mockImplementation(() => {
        return Promise.resolve(expectedDropbox);
      });
    });

    it('does not send the message', async () => {
      options.gateways.evidenceStore.getByDropboxId.mockImplementation(() => {
        return [];
      });
      await sendNotification({ dropboxId: 'abc123456' });
      expect(options.gateways.notify.send).not.toHaveBeenCalled();
    });
  });

  describe('with a requestedBy field', () => {
    const expectedDropbox = new Dropbox({
      id: 'abc123456',
      created: '2020-04-26T18:00:00+0000',
      description: 'A test dropbox'
    });

    beforeEach(() => {
      options.gateways.dropbox.get.mockImplementation(() => {
        return Promise.resolve(expectedDropbox);
      });
    });

    it('sends the message', async () => {
      const requestedBy = 'Ted';
      const requestedByEmail = 'ted@example.com';
      options.gateways.evidenceStore.getByDropboxId.mockImplementation(() => {
        return [{ requestedBy, requestedByEmail }];
      });

      await sendNotification({ dropboxId: 'abc123456' });
      expect(options.gateways.notify.send).toHaveBeenCalledWith(
        expectedDropbox,
        requestedBy,
        requestedByEmail
      );
    });
  });
});
