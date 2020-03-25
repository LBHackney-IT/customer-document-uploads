const authorize = require('./lib/authorize');
const path = require('path');
const { loadTemplates, generateRandomString } = require('./lib/utils');
const { getSession, createSessionToken } = require('./lib/sessions');
const templates = loadTemplates(path.join(__dirname, './templates'));
const { getDropbox, saveDropbox, getDropboxes, createEmptyDropbox, getDownloadUrl } = require('./lib/Dependencies');
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const formidableMiddleware = require('express-formidable');
const app = express();
const globals = {
  staffLoginUrl: `/dropboxes/`,
  stage: process.env.stage
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(formidableMiddleware());

app.get('/login', async (req, res) => {
  const html = templates.loginTemplate({ globals });
  res.send(html);
});

app.get('/dropboxes', async (req, res) => {
  if (authorize(req)) {
    const dropboxes = await getDropboxes();
    const html = templates.staffDropboxListTemplate({ dropboxes, globals });
    res.send(html);
  } else {
    res.redirect(`/login`);
  }
});

app.get('/dropboxes/new', async (req, res) => {
  if (authorize(req)) {
    res.redirect(`/dropboxes`);
  } else {
    let dropboxId;
    const session = getSession(req.headers);

    if (session && session.dropboxId) {
      dropboxId = session.dropboxId;
    } else {
      dropboxId = generateRandomString(15);
      await createEmptyDropbox(dropboxId);
      res.cookie('customerToken', createSessionToken(dropboxId), {
        maxAge: 86400 * 30
      });
    }
    res.redirect(`/dropboxes/${dropboxId}`);
  }
});

app.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);
  if (session && session.dropboxId === req.params.id) {
    const dropbox = await getDropbox(req.params.id);
    const html = templates.userDropboxTemplate({ dropbox, globals, dropboxId: req.params.id });
    res.send(html);
  } else {
    res.redirect(`/dropboxes/new`);
  }
});

app.get('/dropboxes/:id/view', async (req, res) => {
  if (authorize(req)) {
    const dropbox = await getDropbox(req.params.id);
    const html = templates.staffDropboxTemplate({ dropbox, globals, dropboxId: req.params.id });
    res.send(html);
  } else {
    res.redirect(`/login`);
  }
});

app.get('/dropboxes/:dropboxId/file/:fileId', async (req, res) => {
  const dropbox = await getDropbox(req.params.dropboxId)
  console.log(dropbox)
  const file = dropbox.uploads[req.params.fileId];
  if(file){
    const signedUrl = await getDownloadUrl(req.params.dropboxId, req.params.fileId, file.fileName)
    res.redirect(signedUrl)
  }else{
    res.send(404)
  }
})

app.post('/dropboxes/:id', async (req, res) => {
  await saveDropbox(req.params.id, req.fields, req.files.newUploadFile);
  res.redirect(`/dropboxes/${req.params.id}`);
});

const root = async () => {
  return {
    statusCode: 302,
    headers: { Location: `/dropboxes/new` }
  };
};

module.exports = {
  handler: serverless(app),
  root
};
