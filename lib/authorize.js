const jwt = require('jsonwebtoken');
const cookie = require('cookie');

const jwt_secret = process.env.jwtsecret;

const extractTokenFromCookieHeader = req => {
  if (!(req.headers && (req.headers.Cookie || req.headers.cookie))) return null;
  const cookies = cookie.parse(req.headers.Cookie || req.headers.cookie);
  return cookies['hackneyToken'];
};

const extractTokenFromAuthHeader = req => {
  if (!(req.headers && req.headers.authorization)) return null;
  if (req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.replace('Bearer ', '');
  }
  return null;
};

const decodeToken = token => {
  try {
    return jwt.verify(token, jwt_secret);
  } catch (err) {
    return false;
  }
};

const requestAllowed = tokenPayload => {
  if (tokenPayload.iss === 'Hackney' && tokenPayload.groups) {
    return true;
  }
  return false;
};

module.exports = req => {
  const token =
    extractTokenFromAuthHeader(req) || extractTokenFromCookieHeader(req);
  const decodedToken = decodeToken(token);
  return token && decodedToken && requestAllowed(decodedToken);
};
