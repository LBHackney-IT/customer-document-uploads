const authorize = require('./authorize');
const path = require('path');
const { loadTemplates, generateRandomString } = require('./lib/utils');
const { getSession, createSessionToken } = require('./lib/sessions');
const templates = loadTemplates(path.join(__dirname, './templates'));
const serverless = require('serverless-http');
const express = require('express');
const app = express();

app.get('/dropbox', async (req, res) => {
  let dropboxId;
  const session = getSession(req.headers);

  if(session && session.dropboxId){
    dropboxId = session.dropboxId;
  }else{
    dropboxId = generateRandomString(15);
    res.cookie('customerToken', createSessionToken(dropboxId), {maxAge: (86400 * 30)});
  }
  res.redirect(`dropbox/${dropboxId}`);
});

app.get('/dropbox/:id', async (req, res) => {
  const session = getSession(req.headers);
  if(session && session.dropboxId === req.params.id){
    // const dropbox = await getDropbox(event.pathParameters.id);
    const html = templates.userDropboxTemplate({ name: 'Ben' });
    res.send(html);
  }else{
    res.send(400);
  }
});

app.post('/dropbox/:id', async (req, res) => {
  res.redirect(`/dev/dropbox/${req.params.id}`);
});

const root = async event => {
  return {statusCode: 302, headers: {'Location': 'dropbox'}};
}

const authorizer = async event => {
  const result = await authorize(event);
  if (result === 'Unauthorized') throw 'Unauthorized';
  return result;
}

module.exports = {
  handler: serverless(app),
  authorizer,
  root
}
