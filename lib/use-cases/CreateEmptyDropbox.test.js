const { Dropbox } = require('../domain/dropbox');

describe('use-case/create empty dropbox', () => {
  const options = {
    gateways: {
      dropbox: {
        save: jest.fn(item => Promise.resolve(item))
      }
    }
  };

  const createEmptyDropbox = require('./CreateEmptyDropbox')(options);

  it('creates a new dropbox and persists it', async () => {
    const dropbox = await createEmptyDropbox();
    expect(dropbox).toBeInstanceOf(Dropbox);
    expect(options.gateways.dropbox.save).toHaveBeenCalledWith(dropbox);
  });

  it('adds a requestId if there is one', async () => {
    const dropbox = await createEmptyDropbox('123');
    expect(dropbox).toBeInstanceOf(Dropbox);
    expect(dropbox.requestId).toEqual('123');
    expect(options.gateways.dropbox.save).toHaveBeenCalledWith(dropbox);
  });
});
