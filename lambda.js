const authorize = require('./authorize');
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

module.exports = {
  root: async event => {
    const html = templates.rootTemplate({ name: 'Ben' });
    return send(html);
  },
  authorizer: async event => {
    const result = await authorize(event);
    if (result === 'Unauthorized') throw 'Unauthorized';
    return result;
  }
};
