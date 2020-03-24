const jwtSecret = process.env.jwtsecret;
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = {
  getSession: headers => {
    if (headers['cookie'] || headers['Cookie']) {
      cookies = cookie.parse(headers['cookie'] || headers['Cookie']);
      if (cookies.customerToken) {
        return jwt.verify(cookies.customerToken, jwtSecret);
      }
    }
    return false;
  },

  createSessionToken: dropboxId => {
    return jwt.sign({ dropboxId }, jwtSecret);
  }
};
