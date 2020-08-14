const { Dropbox } = require('../domain/dropbox');

describe('use-case/SendNotification', () => {
  const options = {
    gateways: {
      dropbox: {
        get: jest.fn(),
        save: jest.fn(dropbox => Promise.resolve(dropbox))
      },
      email: {
        send: jest.fn()
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
      await sendNotification({ dropboxId: 'abc123456' });
      expect(options.gateways.email.send).not.toHaveBeenCalled();
    });
  });

  describe('with a requestedBy field', () => {
    const expectedDropbox = new Dropbox({
      id: 'abc123456',
      created: '2020-04-26T18:00:00+0000',
      description: 'A test dropbox',
      requestedBy: {
        name: 'Ted',
        email: 'ted@example.com'
      }
    });

    beforeEach(() => {
      options.gateways.dropbox.get.mockImplementation(() => {
        return Promise.resolve(expectedDropbox);
      });
    });

    it('sends the message', async () => {
      await sendNotification({ dropboxId: 'abc123456' });
      expect(options.gateways.email.send).toHaveBeenCalled();
    });
  });
});
