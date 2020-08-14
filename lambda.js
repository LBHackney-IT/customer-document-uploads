const {
  createDocumentRequest,
  getDocumentRequest,
  updateDocumentRequest,
  getDropbox,
  saveDropbox,
  getDropboxes,
  createEmptyDropbox,
  deleteDocument,
  getEvidenceStoreUrl,
  getResolvedDownloadUrl,
  getSession,
  createSessionToken,
  templates,
  authorize,
  updateArchiveStatus,
  sendNotification
} = require('./lib/Dependencies');
const querystring = require('querystring');
const api = require('lambda-api')();
const Sentry = require('@sentry/node');

if (process.env.stage === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN
  });

  api.use(async (err, req, res, next) => {
    console.log(err);
    console.log(`Sentry eventId: ${Sentry.captureException(err)}`);
    await Sentry.flush();
    next();
  });
}

api.get('/css/:filename', async (req, res) => {
  res.sendFile(req.params.filename, {
    root: 'static/css/'
  });
});

api.get('/img/:filename', async (req, res) => {
  res.sendFile(req.params.filename, {
    root: 'static/img/'
  });
});

api.get('/js/:filename', async (req, res) => {
  res.sendFile(req.params.filename, {
    root: 'static/js/'
  });
});

api.use(async (req, res, next) => {
  console.log(`REQUEST: { method: ${req.method}, path: ${req.path} }`);
  next();
});

api.get('/login', async (req, res) => {
  const html = templates.loginTemplate();
  return res.html(html);
});

api.get('/logout', async (req, res) => {
  res
    .clearCookie('hackneyToken', { domain: '.hackney.gov.uk', path: '/' })
    .send();
  res.redirect('/login');
});

api.get('/restart', async (req, res) => {
  res.clearCookie('customerToken').send();
  res.redirect('/dropboxes/new');
});

api.get('/dropboxes', async (req, res) => {
  if (!authorize(req)) {
    return res.redirect('/login');
  }

  const dropboxes = await getDropboxes({ submitted: true });
  const html = templates.staffDropboxListTemplate({ dropboxes });
  res.html(html);
});

api.get('/dropboxes/new', async (req, res) => {
  if (authorize(req)) {
    return res.redirect('/dropboxes');
  }

  if (!req.query.requestId) {
    const session = getSession(req.headers);
    if (session && session.dropboxId) {
      return res.redirect(`/dropboxes/${session.dropboxId}`);
    }
  }

  const dropbox = await createEmptyDropbox();
  res.cookie('customerToken', createSessionToken(dropbox.id), {
    maxAge: 86400 * 30 * 1000
  });

  res.redirect(
    `/dropboxes/${dropbox.id}${
      req.query.requestId ? `?requestId=${req.query.requestId}` : ''
    }`
  );
});

api.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);

  if (!session || (session && session.dropboxId !== req.params.id)) {
    return res.redirect('/dropboxes/new');
  }

  const dropboxId = req.params.id;
  const dropbox = await getDropbox(dropboxId);

  if (!dropbox) {
    res.clearCookie('customerToken');
    return res.redirect('/dropboxes/new');
  }

  const params = { dropbox, dropboxId };

  if (dropbox.submitted) {
    return res.html(templates.readonlyDropboxTemplate(params));
  }

  let metadata = {};
  if (req.query.requestId) {
    const request = await getDocumentRequest(req.query.requestId);
    if (request) metadata = request.metadata;
    if (!request.dropboxId) {
      request.dropboxId = dropboxId;
      await updateDocumentRequest(request);
    }
  }

  const { url, fields, documentId } = await getEvidenceStoreUrl({
    dropboxId,
    metadata
  });

  res.html(
    templates.createDropboxTemplate({
      ...params,
      secureDocumentId: documentId,
      secureUploadUrl: url,
      secureUploadFields: fields
    })
  );
});

api.post('/dropboxes/:id/archive', async (req, res) => {
  const response = await updateArchiveStatus({
    dropboxId: req.params.id,
    archiveStatus: req.body.archiveStatus
  });

  res.json({ response });
});

api.get('/dropboxes/:id/view', async (req, res) => {
  if (!authorize(req)) {
    return res.redirect('/login');
  }

  const dropbox = await getDropbox(req.params.id);
  const html = templates.readonlyDropboxTemplate({
    dropbox,
    dropboxId: req.params.id,
    isStaff: true
  });
  res.html(html);
});

api.get('/dropboxes/:dropboxId/files/:fileId', async (req, res) => {
  const { dropboxId, fileId } = req.params;
  const dropbox = await getDropbox(dropboxId);

  const file = dropbox.uploads.find(upload => upload.id === fileId);

  if (!file) {
    return res.sendStatus(404);
  }

  const downloadUrl = await getResolvedDownloadUrl(file.downloadUrl);
  res.redirect(downloadUrl);
});

api.post('/dropboxes/:dropboxId/files/:fileId', async (req, res) => {
  const session = getSession(req.headers);

  if (session && session.dropboxId === req.params.dropboxId) {
    if (req.body._method === 'DELETE') {
      await deleteDocument(req.params.fileId);
    }
    return res.redirect(`/dropboxes/${req.params.dropboxId}`);
  }

  res.sendStatus(404);
});

api.post('/dropboxes/:dropboxId/notification', async (req, res) => {
  const response = await sendNotification({
    dropboxId: req.params.id
  });
  res.json({ response });
});

api.post('/requests', async (req, res) => {
  if (!authorize(req)) return res.sendStatus(403);
  if (!req.body.metadata) return res.sendStatus(400);
  const docRequest = await createDocumentRequest(req.body.metadata);
  res.send({ requestId: docRequest.id });
});

api.get('/requests/:requestId', async (req, res) => {
  const request = await getDocumentRequest(req.params.requestId);
  if (!request) return res.sendStatus(404);
  if (request.dropboxId) return res.redirect(`/dropboxes/${request.dropboxId}`);
  return res.redirect(`/dropboxes/new?requestId=${request.id}`);
});

const saveDropboxHandler = async event => {
  try {
    if (event.isBase64Encoded) {
      event.body = Buffer.from(event.body, 'base64').toString();
    }

    const session = getSession(event.headers);
    const { dropboxId: pathDropboxId } = event.pathParameters;

    if (!session || session.dropboxId !== pathDropboxId) {
      return { statusCode: 404 };
    }

    const { dropboxId } = session;
    await saveDropbox(dropboxId, querystring.parse(event.body));

    return {
      statusCode: 302,
      headers: { Location: `/dropboxes/${dropboxId}` }
    };
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    await Sentry.flush();
  }
};

module.exports = {
  handler: async (event, context) => {
    return await api.run(event, context);
  },
  saveDropboxHandler
};
