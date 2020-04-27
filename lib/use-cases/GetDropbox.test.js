const { Dropbox, Document } = require('../domain/dropbox');

describe('use-case/get dropbox', () => {
  const options = {
    gateways: {
      dropbox: {
        get: jest.fn()
      },
      document: {
        getByDropboxId: jest.fn(() => Promise.resolve([]))
      }
    }
  };

  const getDropbox = require('./GetDropbox')(options);

  describe('with an invalid dropbox id', () => {
    beforeEach(() => {
      options.gateways.dropbox.get.mockImplementation(() => {
        return Promise.resolve(null);
      });
    });

    it('returns null', async () => {
      const dropbox = await getDropbox('1234567');
      expect(dropbox).toBeNull();
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

    describe('with uploaded documents', () => {
      const expectedDocument = new Document({
        id: 'def123456',
        filename: 'cat.jpg',
        description: 'My favourite cat, Sally',
        downloadUrl: '/download/cat.jpg'
      });

      beforeEach(() => {
        options.gateways.document.getByDropboxId.mockImplementation(() => {
          return Promise.resolve([expectedDocument]);
        });
      });

      it('returns the dropbox and associated uploads', async () => {
        const dropbox = await getDropbox('abc123456');

        expect(dropbox.uploads.length).toBe(1);
        expect(dropbox.uploads).toStrictEqual(
          expect.arrayContaining([expectedDocument])
        );

        expect(dropbox).toStrictEqual(expect.objectContaining(expectedDropbox));
      });

      it('sets hasUploads to true', async () => {
        const dropbox = await getDropbox('abc123456');
        expect(dropbox.hasUploads).toBe(true);
      });
    });

    describe('without uploaded documents', () => {
      beforeEach(() => {
        options.gateways.document.getByDropboxId.mockImplementation(() => {
          return Promise.resolve([]);
        });
      });

      it('sets hasUploads to false', async () => {
        const dropbox = await getDropbox('abc123456');
        expect(dropbox.hasUploads).toBe(false);
      });
    });
  });
});
