const authorize = require('./authorize');

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
    return send('Hello world');
  },
  authorizer: async event => {
    const result = await authorize(event);
    if (result === 'Unauthorized') throw 'Unauthorized';
    return result;
  }
};
