const { Dropbox } = require('../domain/dropbox');

describe('use-case/updateArchiveStatus', () => {
  const options = {
    gateways: {
      dropbox: {
        get: jest.fn(),
        save: jest.fn(dropbox => Promise.resolve(dropbox))
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const updateArchiveStatus = require('./UpdateArchiveStatus')(options);

  describe('with an invalid dropbox id', () => {
    beforeEach(() => {
      options.gateways.dropbox.get.mockImplementation(() => {
        return Promise.resolve(null);
      });
    });

    it('throws an "invalid dropbox" error', async () => {
      expect(updateArchiveStatus('db123456', true)).rejects.toBeInstanceOf(
        Error
      );
    });
  });

  describe('with a valid dropbox id', () => {
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

    it('changes archived status to true', async () => {
      await updateArchiveStatus({
        dropboxId: expectedDropbox.id,
        archiveStatus: true
      });

      expect(options.gateways.dropbox.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'abc123456',
          created: '2020-04-26T18:00:00+0000',
          description: 'A test dropbox',
          archived: true
        })
      );
    });
  });
});
