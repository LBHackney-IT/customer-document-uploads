process.env.GOV_NOTIFY_API_KEY = 'key';
jest.mock('./lib/Dependencies');
const {
  authorize,
  createDocumentRequest,
  getDropbox,
  getDocumentRequest,
  getEvidenceStoreUrl,
  getSession,
  templates
} = require('./lib/Dependencies');

const evt = (method, path, body, query) => {
  let mvq = {};
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      mvq[k] = [v];
    });
  } else {
    mvq = null;
    query = null;
  }

  return {
    body,
    httpMethod: method,
    path,
    multiValueQueryStringParameters: mvq,
    queryStringParameters: query
  };
};

describe('handler routes', () => {
  const handler = require('./lambda').appHandler;

  describe('GET /login', () => {
    it('shows the login page if not logged in', async () => {
      await handler(evt('GET', '/login'), {});
      expect(templates.loginTemplate).toHaveBeenCalled();
    });
  });

  describe('GET /logout', () => {});

  describe('GET /restart', () => {});

  describe('GET /dropboxes', () => {});

  describe('GET /dropboxes/new', () => {});

  describe('GET /dropboxes/:id', () => {
    it('shows the new dropbox template', async () => {
      getSession.mockImplementationOnce(() => ({ dropboxId: '1' }));
      getDropbox.mockImplementationOnce(() => true);
      getEvidenceStoreUrl.mockImplementationOnce(() => ({
        url: '',
        fields: '',
        documentId: ''
      }));
      await handler(evt('GET', '/dropboxes/1'));
      expect(templates.createDropboxTemplate).toHaveBeenCalled();
    });

    it('redirects to new dropbox if no existing session', async () => {
      getSession.mockImplementationOnce(() => false);
      const res = await handler(evt('GET', '/dropboxes/1'));
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/dropboxes/new');
    });

    it('redirects to new dropbox if no existing dropbox', async () => {
      getSession.mockImplementationOnce(() => ({ dropboxId: '1' }));
      getDropbox.mockImplementationOnce(() => false);
      const res = await handler(evt('GET', '/dropboxes/1'));
      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/dropboxes/new');
    });

    it('shows the submitted dropbox page if a dropbox is submitted', async () => {
      getSession.mockImplementationOnce(() => ({ dropboxId: '1' }));
      getDropbox.mockImplementationOnce(() => ({ submitted: true }));
      await handler(evt('GET', '/dropboxes/1'));
      expect(templates.readonlyDropboxTemplate).toHaveBeenCalled();
    });

    it('shows the submitted dropbox page if a dropbox is submitted', async () => {
      getSession.mockImplementationOnce(() => ({ dropboxId: '1' }));
      getDropbox.mockImplementationOnce(() => ({ submitted: true }));
      await handler(evt('GET', '/dropboxes/1'));
      expect(templates.readonlyDropboxTemplate).toHaveBeenCalled();
    });
  });

  describe('GET /dropboxes/:id/view', () => {});

  describe('GET /dropboxes/:dropboxId/files/:fileId', () => {});

  describe('POST /dropboxes/:dropboxId/files/:fileId', () => {});

  describe('POST /dropboxes/:id/archive', () => {});

  describe('POST /requests', () => {
    beforeEach(() => {
      createDocumentRequest.mockImplementationOnce(() => ({ id: '1' }));
    });
    it('creates a document request', async () => {
      authorize.mockImplementationOnce(() => true);
      const metadata = { name: 'Matt' };
      const res = await handler(evt('POST', '/requests', { metadata }));
      expect(createDocumentRequest).toHaveBeenCalledWith(metadata);
      expect(JSON.parse(res.statusCode)).toEqual(201);
      expect(JSON.parse(res.body).requestId).toEqual('1');
    });

    it('returns forbidden if not authorised', async () => {
      authorize.mockImplementationOnce(() => false);
      const res = await handler(evt('POST', '/requests', {}));
      expect(res.statusCode).toEqual(403);
    });

    it('returns bad request if not correct format', async () => {
      authorize.mockImplementationOnce(() => true);
      const res = await handler(evt('POST', '/requests', {}));
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /requests/:requestId', () => {
    it('redirects to staff view if logged in', async () => {
      authorize.mockImplementationOnce(() => true);
      const res = await handler(evt('GET', '/requests/1'));
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toBe('/dropboxes');
    });

    it('returns not found if it does not exist', async () => {
      getDocumentRequest.mockImplementationOnce(() => null);
      const res = await handler(evt('GET', '/requests/1'));
      expect(getDocumentRequest).toHaveBeenCalledWith('1');
      expect(res.statusCode).toEqual(404);
    });

    it('redirects to dropbox if dropbox already exists', async () => {
      getDocumentRequest.mockImplementationOnce(() => ({ dropboxId: '123' }));
      const res = await handler(evt('GET', '/requests/1'));
      expect(getDocumentRequest).toHaveBeenCalledWith('1');
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toBe('/dropboxes/123');
    });

    it('redirects to new dropbox if does not already exist', async () => {
      getDocumentRequest.mockImplementationOnce(() => ({ id: '1' }));
      const res = await handler(evt('GET', '/requests/1'));
      expect(getDocumentRequest).toHaveBeenCalledWith('1');
      expect(res.statusCode).toEqual(302);
      expect(res.headers.location).toBe('/dropboxes/new?requestId=1');
    });
  });
});
