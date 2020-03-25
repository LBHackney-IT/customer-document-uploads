const authorize = require('./authorize');
const path = require('path');
const { loadTemplates, generateRandomString } = require('./lib/utils');
const { getSession, createSessionToken } = require('./lib/sessions');
const templates = loadTemplates(path.join(__dirname, './templates'));
const { getDropbox, saveDropbox } = require('./lib/Dependencies');
const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const formidableMiddleware = require('express-formidable');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(formidableMiddleware());

app.get('/dropboxes/new', async (req, res) => {
  let dropboxId;
  const session = getSession(req.headers);

  if (session && session.dropboxId) {
    dropboxId = session.dropboxId;
  } else {
    dropboxId = generateRandomString(15);
    res.cookie('customerToken', createSessionToken(dropboxId), {
      maxAge: 86400 * 30
    });
  }
  res.redirect(`/${process.env.stage}/dropboxes/${dropboxId}`);
});

app.get('/dropboxes/:id', async (req, res) => {
  const session = getSession(req.headers);
  if (session && session.dropboxId === req.params.id) {
    const dropbox = await getDropbox(req.params.id);
    const html = templates.userDropboxTemplate({ dropbox });
    res.send(html);
  } else {
    res.redirect(`/${process.env.stage}/dropboxes/new`);
  }
});

app.post('/dropboxes/:id', async (req, res) => {
  await saveDropbox(req.params.id, req.fields, req.files.upload);
  res.redirect(`/${process.env.stage}/dropboxes/${req.params.id}`);
});

const root = async () => {
  return {
    statusCode: 302,
    headers: { Location: `/${process.env.stage}/dropboxes/new` }
  };
};

const authorizer = async event => {
  const result = await authorize(event);
  if (result === 'Unauthorized') throw 'Unauthorized';
  return result;
};

module.exports = {
  handler: serverless(app),
  authorizer,
  root
};
