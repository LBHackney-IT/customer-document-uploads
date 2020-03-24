const authorize = require('./authorize');
const path = require('path');
const { loadTemplates, generateRandomString } = require('./lib/utils');
const { getSession, createSessionCookie } = require('./lib/sessions');
const templates = loadTemplates(path.join(__dirname, './templates'));

const send = body => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body
  };
};

const redirect = (url, cookie) => {
  const result = {
    statusCode: 302,
    headers: {
      'Location': url
    }
  };
  if(cookie) result.headers['Set-Cookie'] = cookie;
  return result;
};

module.exports = {
  root: async event => {
    let dropboxId;
    let cookie = null;
    const session = getSession(event.headers);

    if(session && session.dropboxId){
      dropboxId = session.dropboxId;
    }else{
      dropboxId = generateRandomString(15);
      cookie = createSessionCookie(dropboxId)
    }
    return redirect(`/dev/dropbox/${dropboxId}`, cookie);
  },

  getDropbox: async event => {
    const html = templates.userDropboxTemplate({ name: 'Ben' });
    return send(html);
  },

  updateDropbox: async event => {
    return redirect(`/dev/dropbox/${event.pathParameters.id}`);
  },

  authorizer: async event => {
    const result = await authorize(event);
    if (result === 'Unauthorized') throw 'Unauthorized';
    return result;
  }
};
