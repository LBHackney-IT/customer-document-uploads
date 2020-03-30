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
const querystring = require('querystring');
const serverless = require('serverless-http');
const express = require('express');
const multipart = require('aws-lambda-multipart-parser');
const app = express();
const pathPrefix = '';

const Sentry = require('@sentry/node');
Sentry.init({
  dsn: process.env.SENTRY_DNS
});

const logError = async err => {
  console.log(err);
  console.log(`Sentry eventId: ${Sentry.captureException(err)}`);
  await Sentry.flush();
};

app.use(express.static(__dirname + '/static'));

app.get('/login', async (req, res) => {
  try {
    const html = templates.loginTemplate({ pathPrefix });
    res.send(html);
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

app.get('/dropboxes', async (req, res) => {
  try {
    if (authorize(req)) {
      const dropboxes = await getDropboxes({ submitted: true });
      const html = templates.staffDropboxListTemplate({
        dropboxes,
        pathPrefix
      });
      res.send(html);
    } else {
      res.redirect(`${pathPrefix}/login`);
    }
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

app.get('/dropboxes/new', async (req, res) => {
  try {
    if (authorize(req)) {
      res.redirect(`${pathPrefix}/dropboxes`);
    } else {
      let dropboxId;
      const session = getSession(req.headers);

      if (session && session.dropboxId) {
        dropboxId = session.dropboxId;
      } else {
        dropboxId = generateRandomString(15);
        await createEmptyDropbox(dropboxId);
        res.cookie('customerToken', createSessionToken(dropboxId), {
          maxAge: 86400 * 30 * 1000
        });
      }
      res.redirect(`${pathPrefix}/dropboxes/${dropboxId}`);
    }
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

app.get('/dropboxes/:id', async (req, res) => {
  try {
    const session = getSession(req.headers);
    if (session && session.dropboxId === req.params.id) {
      const dropbox = await getDropbox(req.params.id);
      if (dropbox) {
        dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
        const params = {
          dropbox,
          pathPrefix,
          dropboxId: req.params.id
        };
        const html = dropbox.submitted
          ? templates.readonlyDropboxTemplate(params)
          : templates.createDropboxTemplate(params);
        res.send(html);
      } else {
        res.clearCookie('customerToken');
        res.redirect(`${pathPrefix}/dropboxes/new`);
      }
    } else {
      res.redirect(`${pathPrefix}/dropboxes/new`);
    }
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

app.get('/dropboxes/:id/view', async (req, res) => {
  try {
    if (authorize(req)) {
      const dropbox = await getDropbox(req.params.id);
      dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
      const html = templates.readonlyDropboxTemplate({
        dropbox,
        pathPrefix,
        dropboxId: req.params.id,
        isStaff: true
      });
      res.send(html);
    } else {
      res.redirect(`${pathPrefix}/login`);
    }
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

app.get('/dropboxes/:dropboxId/file/:fileId', async (req, res) => {
  try {
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
      res.send(404);
    }
  } catch (err) {
    await logError(err);
    res.sendStatus(500);
  }
});

const isMultipart = event => {
  const contentType =
    event.headers['Content-Type'] || event.headers['content-type'];
  return contentType && contentType.startsWith('multipart/form-data');
};

const saveDropboxHandler = async event => {
  try {
    let formData;
    if (event.isBase64Encoded)
      event.body = Buffer.from(event.body, 'base64').toString('binary');
    if (isMultipart(event)) {
      formData = multipart.parse(event);
    } else {
      formData = querystring.parse(event.body);
    }

    await saveDropbox(event.pathParameters.dropboxId, formData);

    return {
      statusCode: 302,
      headers: {
        Location: `${pathPrefix}/dropboxes/${event.pathParameters.id}`
      }
    };
  } catch (err) {
    await logError(err);
    return {
      statusCode: 500
    };
  }
};

const deleteDocumentHandler = async event => {
  try {
    if (event.isBase64Encoded)
      event.body = Buffer.from(event.body, 'base64').toString('binary');
    const formData = querystring.parse(event.body);
    if (formData._method === 'DELETE') {
      await deleteDocument(
        event.pathParameters.dropboxId,
        event.pathParameters.documentId
      );
    }

    return {
      statusCode: 302,
      headers: {
        Location: `${pathPrefix}/dropboxes/${event.pathParameters.dropboxId}`
      }
    };
  } catch (err) {
    await logError(err);
    return {
      statusCode: 500
    };
  }
};

const root = async () => {
  try {
    return {
      statusCode: 302,
      headers: { Location: `${pathPrefix}/dropboxes/new` }
    };
  } catch (err) {
    await logError(err);
    return {
      statusCode: 500
    };
  }
};

module.exports = {
  handler: serverless(app),
  root,
  saveDropbox: saveDropboxHandler,
  deleteDocument: deleteDocumentHandler
};
