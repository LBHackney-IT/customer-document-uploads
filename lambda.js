const authorize = require('./lib/authorize');
const path = require('path');
const querystring = require('querystring');
const { loadTemplates, generateRandomString } = require('./lib/utils');
const { getSession, createSessionToken } = require('./lib/sessions');
const templates = loadTemplates(path.join(__dirname, './templates'));
const {
  getDropbox,
  saveDropbox,
  getDropboxes,
  createEmptyDropbox,
  getDownloadUrl,
  deleteDocument
} = require('./lib/Dependencies');
const serverless = require('serverless-http');
const express = require('express');
const multipart = require('aws-lambda-multipart-parser');
const app = express();
const pathPrefix = '';

app.use(express.static(__dirname + '/static'));

app.get('/login', async (req, res) => {
  const html = templates.loginTemplate({ pathPrefix });
  res.send(html);
});

app.get('/dropboxes', async (req, res) => {
  if (authorize(req)) {
    const dropboxes = await getDropboxes();
    const html = templates.staffDropboxListTemplate({ dropboxes, pathPrefix });
    res.send(html);
  } else {
    res.redirect(`${pathPrefix}/login`);
  }
});

app.get('/dropboxes/new', async (req, res) => {
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
});

app.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);
  if (session && session.dropboxId === req.params.id) {
    const dropbox = await getDropbox(req.params.id);
    dropbox.hasUploads = Object.keys(dropbox.uploads).length > 0;
    const params = {
      dropbox,
      pathPrefix,
      dropboxId: req.params.id
    }
    const html = dropbox.submitted
      ? templates.readonlyDropboxTemplate(params)
      : templates.createDropboxTemplate(params);
    res.send(html);
  } else {
    res.redirect(`${pathPrefix}/dropboxes/new`);
  }
});

app.get('/dropboxes/:id/view', async (req, res) => {
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
});

app.get('/dropboxes/:dropboxId/file/:fileId', async (req, res) => {
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
});

const saveDropboxHandler = async event => {
  let formData;
  if (event.isBase64Encoded) event.body = Buffer.from(event.body, 'base64').toString('binary');
  if (event.headers['Content-Type'] && event.headers['Content-Type'].startsWith('multipart/form-data')) {
    formData = multipart.parse(event);
  } else {
    formData = querystring.parse(event.body);
  }

  await saveDropbox(event.pathParameters.dropboxId, formData);

  return {
    statusCode: 302,
    headers: { Location: `${pathPrefix}/dropboxes/${event.pathParameters.id}` }
  };
};

const deleteDocumentHandler = async (event) => {
  if(event.isBase64Encoded) event.body = Buffer.from(event.body, 'base64').toString('binary')
  const formData = querystring.parse(event.body)
  if(formData._method === 'DELETE'){
    await deleteDocument(event.pathParameters.dropboxId, event.pathParameters.documentId);
  }

  return {
    statusCode: 302,
    headers: { Location: `${pathPrefix}/dropboxes/${event.pathParameters.dropboxId}` }
  };
}

const root = async () => {
  return {
    statusCode: 302,
    headers: { Location: `${pathPrefix}/dropboxes/new` }
  };
};

module.exports = {
  handler: serverless(app),
  root,
  saveDropbox: saveDropboxHandler,
  deleteDocument: deleteDocumentHandler
};
