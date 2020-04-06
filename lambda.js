const {
  getDropbox,
  saveDropbox,
  getDropboxes,
  createEmptyDropbox,
  getDownloadUrl,
  deleteDocument,
  generateRandomString,
  getSession,
  createSessionToken,
  templates,
  authorize
} = require('./lib/Dependencies');
const multipart = require('aws-lambda-multipart-parser');
const querystring = require('querystring');
const api = require('lambda-api')();

if (process.env.stage === 'production') {
  const Sentry = require('@sentry/node');
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

api.use(async (req, res, next) => {
  console.log(`REQUEST: { method: ${req.method}, path: ${req.path} }`);
  next();
});

api.get('/login', async (req, res) => {
  const html = templates.loginTemplate({ host: req.headers.host });
  res.html(html);
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
  const html = templates.staffDropboxListTemplate({
    dropboxes
  });
  res.html(html);
});

api.get('/dropboxes/new', async (req, res) => {
  if (authorize(req)) {
    return res.redirect('/dropboxes');
  }

  const session = getSession(req.headers);
  if (session && session.dropboxId) {
    return res.redirect(`/dropboxes/${session.dropboxId}`);
  }

  const dropboxId = generateRandomString(15);
  await createEmptyDropbox(dropboxId);
  res.cookie('customerToken', createSessionToken(dropboxId), {
    maxAge: 86400 * 30 * 1000
  });
  res.redirect(`/dropboxes/${dropboxId}`);
});

api.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);
  if (!session || (session && session.dropboxId !== req.params.id)) {
    return res.redirect('/dropboxes/new');
  }

  const dropbox = await getDropbox(req.params.id);
  if (!dropbox) {
    res.clearCookie('customerToken');
    return res.redirect('/dropboxes/new');
  }

  const params = { dropbox, dropboxId: req.params.id };
  const html = dropbox.submitted
    ? templates.readonlyDropboxTemplate(params)
    : templates.createDropboxTemplate(params);
  res.html(html);
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
  const dropbox = await getDropbox(req.params.dropboxId);

  const file = dropbox.uploads[req.params.fileId];
  if (!file) {
    return res.sendStatus(404);
  }

  const signedUrl = await getDownloadUrl(
    req.params.dropboxId,
    req.params.fileId,
    file.fileName
  );
  res.redirect(signedUrl);
});

api.post('/dropboxes/:dropboxId/files/:fileId', async (req, res) => {
  const session = getSession(req.headers);
  if (session && session.dropboxId === req.params.dropboxId) {
    if (req.body._method === 'DELETE') {
      await deleteDocument(req.params.dropboxId, req.params.fileId);
    }
    return res.redirect(`/dropboxes/${req.params.dropboxId}`);
  }
  res.sendStatus(404);
});

const isMultipart = event => {
  const contentType =
    event.headers['Content-Type'] || event.headers['content-type'];
  return contentType && contentType.startsWith('multipart/form-data');
};

const saveDropboxHandler = async event => {
  const session = getSession(event.headers);
  if (
    !session ||
    (session && session.dropboxId !== event.pathParameters.dropboxId)
  ) {
    return { statusCode: 404 };
  }

  if (event.isBase64Encoded) {
    event.body = Buffer.from(event.body, 'base64').toString('binary');
  }

  if (isMultipart(event)) {
    await saveDropbox(event.pathParameters.dropboxId, multipart.parse(event));
  } else {
    await saveDropbox(
      event.pathParameters.dropboxId,
      querystring.parse(event.body)
    );
  }

  return {
    statusCode: 302,
    headers: { Location: `/dropboxes/${event.pathParameters.dropboxId}` }
  };
};

module.exports = {
  handler: async (event, context) => {
    return await api.run(event, context);
  },
  saveDropboxHandler
};
