const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const jwt_secret = process.env.jwtsecret;

const extractTokenFromCookieHeader = (req) => {
  if (!(req.headers && req.headers.Cookie)) return null;
  const cookies = cookie.parse(req.headers.Cookie);
  return cookies['hackneyToken'];
}

const decodeToken = token => {
  try {
    return jwt.verify(token, jwt_secret);
  } catch (err) {
    return false;
  }
};

const requestAllowed = async (tokenPayload, req) => {
  console.log(tokenPayload)
  if (tokenPayload.iss === 'Hackney' && tokenPayload.groups) {
    return true;
  }
};

module.exports = req => {
  const token = extractTokenFromCookieHeader(req);
  const decodedToken = decodeToken(token);
  return (token && decodedToken && requestAllowed(decodedToken, req));
};
