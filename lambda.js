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
const api = require('lambda-api')();

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
  if (authorize(req)) {
    const dropboxes = await getDropboxes({ submitted: true });
    const html = templates.staffDropboxListTemplate({
      dropboxes
    });
    res.html(html);
  } else {
    res.redirect('/login');
  }
});

api.get('/dropboxes/new', async (req, res) => {
  if (authorize(req)) {
    res.redirect('/dropboxes');
  } else {
    const session = getSession(req.headers);

    if (session && session.dropboxId) {
      res.redirect(`/dropboxes/${session.dropboxId}`);
    } else {
      const dropboxId = generateRandomString(15);
      await createEmptyDropbox(dropboxId);
      res.cookie('customerToken', createSessionToken(dropboxId), {
        maxAge: 86400 * 30 * 1000
      });
      res.redirect(`/dropboxes/${dropboxId}`);
    }
  }
});

api.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);
  if (session && session.dropboxId === req.params.id) {
    const dropbox = await getDropbox(req.params.id);
    if (dropbox) {
      dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
      const params = {
        dropbox,
        dropboxId: req.params.id
      };
      const html = dropbox.submitted
        ? templates.readonlyDropboxTemplate(params)
        : templates.createDropboxTemplate(params);
      res.html(html);
    } else {
      res.clearCookie('customerToken');
      res.redirect('/dropboxes/new');
    }
  } else {
    res.redirect('/dropboxes/new');
  }
});

api.get('/dropboxes/:id/view', async (req, res) => {
  if (authorize(req)) {
    const dropbox = await getDropbox(req.params.id);
    dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
    const html = templates.readonlyDropboxTemplate({
      dropbox,
      dropboxId: req.params.id,
      isStaff: true
    });
    res.html(html);
  } else {
    res.redirect('/login');
  }
});

api.get('/dropboxes/:dropboxId/files/:fileId', async (req, res) => {
  const dropbox = await getDropbox(req.params.dropboxId);
  const file = dropbox.uploads[req.params.fileId];
  if (file) {
    const signedUrl = await getDownloadUrl(
      req.params.dropboxId,
      req.params.fileId,
      file.fileName
    );
    res.redirect(signedUrl);
  } else {
    res.sendStatus(404);
  }
});

const isMultipart = req => {
  const contentType =
    req.headers['Content-Type'] || req.headers['content-type'];
  return contentType && contentType.startsWith('multipart/form-data');
};

api.post('/dropboxes/:id', async (req, res) => {
  if (isMultipart(req)) {
    await saveDropbox(req.params.id, multipart.parse(req));
  } else {
    await saveDropbox(req.params.id, req.body);
  }
  res.redirect(`/dropboxes/${req.params.id}`);
});

api.delete('/dropboxes/:dropboxId/files/:fileId', async (req, res) => {
  await deleteDocument(req.params.dropboxId, req.params.fileId);
  res.redirect(`/dropboxes/${req.params.dropboxId}`);
});

module.exports = {
  handler: async (event, context) => {
    return await api.run(event, context);
  }
};
